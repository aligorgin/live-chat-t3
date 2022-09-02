import {useRouter} from "next/router";
import {signIn, useSession} from "next-auth/react";
import {useState} from "react";
import {Message} from "../../constants/schemas";
import {trpc} from "../../utils/trpc";
import {Session} from "next-auth";


function MessageItem({message, session}: { message: Message, session: Session }) {
    return <li>
        {message.message}
    </li>
}

export default function RoomPage() {
    const {query} = useRouter();
    const roomId = query.roomId as string;
    const {data: session} = useSession();

    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<Message[]>([])

    const {mutateAsync: sendMessageMutation} = trpc.useMutation(['room.send-message']);

    trpc.useSubscription(['room.onSendMessage', {roomId}], {
        onNext: (message) => {
            setMessages((m) => {
                return [...m, message]
            })
        }
    })

    if (!session) {
        return (
            <div>
                <button onClick={() => signIn()}>Login</button>
            </div>
        )
    }

    return (
        <div>
            <ul>
                {messages.map((m) => {
                    return <MessageItem message={m} session={session}/>
                })}
            </ul>
            <form onSubmit={(e) => {
                e.preventDefault()
                sendMessageMutation({roomId, message})
            }}>
                <textarea placeholder='what do you want to say'></textarea>
                <button>Send message</button>
            </form>
        </div>
    )
}
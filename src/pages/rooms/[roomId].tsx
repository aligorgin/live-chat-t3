import {useRouter} from "next/router";
import {signIn, useSession} from "next-auth/react";

export default function RoomPage() {
    const {query} = useRouter();
    const roomId = query.roomId as string;
    const {data: session} = useSession();

    if (!session) {
        return (
            <div>
                <button onClick={() => signIn()}>Login</button>
            </div>
        )
    }

    return (
        <div>
            welcome to room {roomId}
        </div>
    )
}
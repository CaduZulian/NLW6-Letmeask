import { useEffect, useState } from "react"
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";

type firebaseQuestions = Record<string, {
  author: {
    name: string,
    avatar: string
  }
  content: string,
  isPrivate: boolean;
  isAnswered: boolean,
  isHighLighted: boolean
  likes: Record<string, {
    authorId: string
  }>
}>

type QuestionType = {
  id: string;
  author: {
    name: string;
    avatar: string;
  }
  content: string;
  isAnswered: boolean;
  isHighLighted: boolean;
  likeCount: number;
  likeId: string | undefined;
}

export function useRoom(roomId: string){
  const { user } = useAuth();
  const [questions, setQuestion] = useState<QuestionType[]>([])
  const [title, setTitle] = useState('')
  const [authorCode, setAuthorCode] = useState('')


  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);

    roomRef.on('value', room =>{
      const databaseRoom = room.val();
      const firebaseQuestions: firebaseQuestions = databaseRoom.questions ?? {};

      const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) =>{
        return {
          id: key,
          content: value.content,
          author: value.author,
          isHighLighted: value.isHighLighted,
          isAnswered: value.isAnswered,
          likeCount: Object.values(value.likes ?? {}).length,
          likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0],
        }
      })
      setTitle(databaseRoom.title);
      setAuthorCode(databaseRoom.authorId);
      setQuestion(parsedQuestions)
    })

    return () => {
      roomRef.off('value')
    }
  }, [roomId, user?.id]);

  return{questions, title, authorCode}
}
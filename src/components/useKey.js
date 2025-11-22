import { useEffect, useRef } from "react";
export default function useKey(key, cb){
    const callback = useRef(cb);

    useEffect(() => {
        callback.current = cb;
    })


    useEffect(() => {
        function handle(event){
            if(event.code === key){
                callback.current(event);
            } else if (key === 'ctrls' && event.key === 's' && event.ctrlKey) {
                callback.current(event);
            }
        }

        document.addEventListener('keydown',handle);
        return () => document.removeEventListener("keydown",handle)
    },[key])
}

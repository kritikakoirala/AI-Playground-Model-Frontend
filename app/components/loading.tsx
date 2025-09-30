interface LoadingProps {
  className?: string; // className is optional and of type string
}

const  Loading = ({className}:LoadingProps) =>{
    return(

        <div className="flex gap-2 justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>

            <p className={`${className} text-sm font-bold`}> Loading </p>
        </div>
    )
}

export default Loading
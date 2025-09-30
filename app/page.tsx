'use client';

import { useEffect, useRef, useState } from 'react';
import Loading from './components/loading';


interface SessionType{
  _id:string,
  prompt:string,

}


let BACKEND_URL = 'https://ai-playground-model-backend-production.up.railway.app'
export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [models, setModels] = useState<Record<string, string>>({});
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [isLoading, setIsLoading] = useState({
    type:'',
    loading:false
  });
  const eventSourceRef = useRef<EventSource | null>(null);
  const [errorMsg, setErrorMsg] = useState("")
  const [showTab, setShowTab] = useState("prompt")
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [statuses, setStatuses] = useState<Record<string, string>>({});



  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setModels({});
    setSessionId(null);
    setStatuses({});
    setMetrics({})
    setErrorMsg("")
    setIsLoading({type:"prompt", loading:true});

    const res = await fetch(`${BACKEND_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    const id = data ? data.sessionId: '';

    data!==undefined && setSessionId(id);


    // console.log("@id", id)
    if(id!==undefined){
    const evtSource = new EventSource(`${BACKEND_URL}/sessions/stream/${id}`);
    eventSourceRef.current = evtSource;

    
    evtSource.onmessage = (event) => {

      setIsLoading({type:"prompt", loading:false});

      const parsed = JSON.parse(event.data);

      const { model, chunk } = parsed;

      setStatuses((prev) => ({
            ...prev,
            [model]: 'streaming',
      }));

      // Append chunk to model's content
      setModels((prev) => ({
        ...prev,
        [model]: (prev[model] || '') + chunk,
      }));

      
    };

    evtSource.addEventListener('end', () => {

    Object.keys(models).forEach(model => {
        setStatuses(prev => ({
        ...prev,
        [model]: 'complete',
      }));
    })

      setPrompt("")
  
      evtSource.close();
    });

    
    evtSource.addEventListener('metrics', (event) => {
      const data = JSON.parse(event.data);
      console.log("@metrics", metrics)
      // console.log("@data", data)
      setStatuses(prev => {
        const newStatuses = { ...prev };
        Object.keys(data).forEach(model => {
          newStatuses[model] = 'complete';
        });
        return newStatuses;
      });

      setMetrics(data);
    });

    evtSource.addEventListener('error', (event: MessageEvent) => {

      setIsLoading({type:"prompt", loading:false})
      
      const errorData = JSON.parse(event.data);
       const { model, message } = errorData;

      setStatuses((prev) => ({
        ...prev,
        [model]: 'error',
      }));

      setModels((prev) => ({
        ...prev,
        [model]: `[Error]: ${message}`,
      }));

      setErrorMsg(message); // Optional, for global error UI
        });
    } else{
      setIsLoading({type:"prompt", loading:false})
      setErrorMsg("Something Went Wrong. Please try again later")
    }

  };


  // console.log("@models", models)

  const loadSession = async (id: string) => {
    // setIsLoading(true);
    setModels({});
    const res = await fetch(`${BACKEND_URL}/sessions/${id}`);
    const data = await res.json();

    // console.log(data)
    setPrompt(data.prompt);
    setSessionId(data._id);
    setMetrics(data?.metricsPerModel)
    setStatuses(data?.statusPerModel)

    const newModels: Record<string, string> = {};
    const responses = data.responsePerModel || {};

    // console.log(responses)
    for (const model of data.models || []) {
      newModels[model] = responses[model] || '[No Response]';
    }

    setModels(newModels);
   
  };


  const loadAllSessions = async () =>{
    setIsLoading({type:"sessions", loading:true});

    const res = await fetch(`${BACKEND_URL}/sessions`);
    const data = await res.json();
    setIsLoading({type:"sessions", loading:false});
    setSessions(data);
  }


  return (
   <div className='w-full h-screen bg-[#434343] flex '>    
    <div className='flex flex-col bg-linear-to-r from-[#A8E6CF] to-[#DCEDC1] justify-center items-center gap-y-10  pt-0 px-10 '> 
      <h1 className='text-2xl text-center tracking-wide'> AI Model Playground  </h1>
       <div className=' '> 
       

          <button
          className={`py-3 cursor-pointer px-6 text-sm font-medium transition-colors duration-150 ${
            showTab === 'prompt'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => {setShowTab('prompt'), setSessions([]),   setModels({});
}}
        >
          Prompt
        </button>
        <button
          className={`py-3 cursor-pointer px-6 text-sm font-medium transition-colors duration-150 ${
            showTab === 'sessions'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => {setShowTab('sessions'), loadAllSessions(),   setModels({}), setPrompt("");
}}
        >
          Sessions
        </button>
            
        </div>


        {
          showTab==='prompt' ? 

          <>
            <div className='text-center bg-white mx-auto w-[25vw] py-10 px-4 rounded-lg shadow-[0_2px_2px_rgba(0,0,0,0.3)]'> 
        
          <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className='w-full'
              // style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
          />
        </div>    
        <button
          onClick={()=>handleSubmit()} 
          className='bg-black text-white w-auto mx-auto py-3 px-6
          text-center cursor-pointer hover:opacity-90 rounded-xl disabled:bg-gray-700 disabled:hover:opacity-100 disabled:cursor-not-allowed'
          disabled={(isLoading?.type==='prompt' && isLoading?.loading===true) || prompt===''}
          >
            Generate Response
        </button>
          </>
          :

          <div className='h-[360px] w-[25vw] bg-white rounded-xl overflow-hidden shadow-[0_2px_2px_rgba(0,0,0,0.4)]'>

            <div className=' h-full  overflow-y-scroll'>

              {
                isLoading?.type==='sessions' && isLoading?.loading ?

                <Loading />
                : 
                
                // models[mode]
                sessions?.map((session)=>{
                  // console.log(session)
                  return (
                  
                     <div
                      key={session?._id }
                      className="cursor-pointer hover:bg-gray-100 p-4  my-3 border-b last:border-b-0"
                      onClick={() => loadSession(session?._id)}
                    >
                      <strong>Prompt:</strong> {session?.prompt.length > 50 ? session?.prompt.slice(0, 50) + '...' : session?.prompt}
                      <br />
                      <small className="text-gray-500">ID: {session?._id.slice(-6)}</small>
                    </div>
                  )
                })
              }
            </div>


          </div>
        }

        
    </div>


      <div className='flex-1 p-10 '> 
        {/* <h1> See the results here</h1> */}

        {Object.keys(models).length === 0 ? (
           isLoading?.type==='prompt' && isLoading?.loading?
            <Loading className="text-white justify-center items-center"/>:
          <div className="h-full text-white text-md flex text-center justify-center items-center text-lg tracking-wide">
            Submit a prompt or select a session to see results.
          </div>

        )
        :
        <div className='flex flex-wrap gap-5 pt-6' > 
        
          {
            isLoading?.type==='prompt' && isLoading?.loading?
            <Loading className="text-white justify-center items-center"/>
            :

            // models[model]
            Object.keys(models).map((model, index) => (
              <div className='flex flex-col mx-auto' key={index}>
                <div className='w-[400px] h-[400px] rounded-2xl  overflow-hidden'>
                  <div className="bg-white p-10  h-full  overflow-y-scroll shadow-[0_2px_2px_rgba(0,0,0,0.4)]" key={model}>
                      <p className="font-semibold ">
                        Model:{' '}
                        {model}</p>

                      <p className="border-b text-sm mb-1 mb-5 py-4">
                          <strong>Status:</strong>{' '}

                          <span className='bg-linear-to-r from-[#A8E6CF] to-[#DCEDC1] px-3 font-semibold  py-1 rounded-3xl'>{statuses[model]}  </span>
                          
                        </p>

                      <p className={`whitespace-pre-wrap text-sm mb-3 text-justify text-sm ${statuses[model]==='error'?'text-red-800 ':'text-black'} `}>
                        {statuses[model]==='complete' && (models[model] === ' ' || !models[model])
                          ? <span className="text-red-500 font-semibold">Sorry, we couldn't generate the respose you wanted. Hit Refresh and Try again.</span>
                          :
                           
                          models[model]}
                      </p>

                    
                </div>
              </div>
              {
              statuses[model] === 'streaming'?
                <p className='text-white text-sm font-bold uppercase py-10 tracking-wide'> Wait for the metrics to load... </p>
              :
              metrics[model] && (
                <div className="
                text-gray-600 mt-6 border-t  bg-linear-to-r from-[#A8E6CF] to-[#DCEDC1]
                  w-auto p-5 rounded-2xl space-y-2 text-md 
                ">
                  <p><strong>Time:</strong> {(metrics[model]?.durationMs / 1000)?.toFixed(2)}s</p>
                  <p><strong>Tokens Used:</strong> {metrics[model]?.tokens}</p>
                  <p><strong>Cost:</strong> ${metrics[model]?.cost?.toFixed(5)}</p>
                </div>
              )}
              </div>

            ))
        }
        </div>

      }
      </div>
  
    </div>

  );
}

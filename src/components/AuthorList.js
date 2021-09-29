import React, {useState, useEffect} from 'react'



const AuthorList = () => {
    const [authors, setAuthors] = useState([]);
    const [works, setWorks] = useState([]);

    //Variable to limit our search results
    let limiter = 0;

    //Fetches our authordata on startup
    useEffect(()=>{
        getAuthors();
    }, [])

    //Fires our getWork funkction when we know the list with authors is ready
    useEffect(()=>{
        getWorks();
    }, [authors])

    //Fetches information about works
    const getAuthors = async ()=>{

        //Fetches the information about authors and their workID
        const uriAuthors = 'https://reststop.randomhouse.com/resources/authors?firstName=Joanne';
        const resp = await fetch(uriAuthors, {
            headers:{
                'Accept': 'application/json'
            }
        });
        const data = await resp.json();

        //Clean Up our api responses from null and undefined
        const filteredResponse = data.author.filter(obj=>{
            if(obj.works){
                return obj;
            }
        })

        //Creates an array of objects with authors and matching work id and updates our hook
        const authorInfo = filteredResponse.map(obj=>{
            if(obj.works){
                return {name: `${obj.authorfirst} ${obj.authorlast}`, id: obj.works.works};
            }
        })
        setAuthors(authorInfo);
    }

    //Fetches our workdata from endopint based on workID
    const getWorks = async () =>{
    
    //Wrapping this in a promise to avoid problems
    let workList = await Promise.all(authors.map(async obj=>{
        //Checks if an author have multiple works
        if(Array.isArray(obj.id)){
                return await Promise.all(obj.id.map(async value=>{
                    const uriWorks = `https://reststop.randomhouse.com/resources/works/${value}`;
                    const resp = await fetch(uriWorks, {
                        headers:{
                            'Accept': 'application/json'
                        }
                    });
                    const data = await resp.json();
                    return data;
                }));
        }else{
                let uriWorks = `https://reststop.randomhouse.com/resources/works/${obj.id}`;
                let resp = await fetch(uriWorks, {
                    headers:{
                        'Accept': 'application/json'
                    }
                });
                let data = await resp.json();
                return data;
            }
        })
        )

    setWorks(workList);
    }

    return (
        <div>
            <ul>
            {
                works.map((item, i)=>{
                    if(Array.isArray(item)){
                        return item.map((obj, i)=>{
                            limiter++;
                            if(limiter < 11){
                                return (
                                    <li key={i}><p>{`${obj.titleAuth}, ${obj.onsaledate.substring(0,10)}`}</p></li>
                                )
                            }
                        })
                    }else{
                        limiter++;
                        if(limiter < 11){
                            return (
                            <li key={i}><p>{`${item.titleAuth}, ${item.onsaledate.substring(0,10)}`}</p></li>
                            )
                        }
                    }
                })
            }
            </ul>
        </div>
    )
}

export default AuthorList

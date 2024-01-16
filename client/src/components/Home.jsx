import React,{ useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';

import TournCard from "./tournament/TournCard";

export default function Home({serverUrl,pagination}) {
    const [tournaments, setTournaments] = useState([]);
    const [maxPage, setMaxPage] = useState(0);
    const [pageCount, setPageCount] = useState(1);
    var { page } = useParams();

    //console.log("hey "+page);
    // if(page){
    //     setPageCount(Number(page));
    // }

    useEffect(()=>{
        setPageCount(Number(page) || 1);
        console.log("hey "+pageCount);
        fetch(`${serverUrl}tournaments`)
        .then((response) => response.json())
        .then((data) => {
            const start = (pageCount-1)*pagination;
            setMaxPage(Math.ceil(data.length/pagination));
            setTournaments(data.slice(start,start+pagination));
        })
    
    },[page,pageCount, serverUrl, pagination]);

    const nextPage = Math.min(pageCount+1,maxPage);
    const prevPage = Math.max(pageCount-1,1);

    return(<div>
        <ul>
          {tournaments.map(t => <TournCard tournamentObject={t} key={t.id}  />)}
        </ul>
        <div class="row fill">
            {pageCount-1 >= 1  && <Link to={`/${prevPage}`}>Previous</Link>}
            <div class="empty"></div>
            {pageCount+1 <= maxPage && <Link to={`/${nextPage}`}>Next</Link>}
        </div>
    </div>)
}


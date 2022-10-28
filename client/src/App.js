import React, {useState} from 'react';
import Table, { AvatarCell, BenefPill, StatusPill } from './Table'  // new
import Button from '@mui/material/Button';

const getData = () => {
  const data = [
    {
      date: '2022-08-05T22:00:00.000Z',
      HomeTeam: 'Betis',
      AwayTeam: 'Elche',
      homeImgUrl: 'https://www.flashscore.fr/res/image/data/hvyaw5HG-lUcXmrQf.png',
      awayImgUrl: 'https://www.flashscore.fr/res/image/data/UcRA5fil-46ZOuRh1.png',
      prono: -1,
      ODD_HOME: 1.43,
      OD_DRAW_OR_AWAY: 2.56,
      confidence: 80
    }
  ]
  return [...data]
}

function App() {
  const [pronosData, setPronosData] = useState([])
  const [allPronosData, setAllPronosData] = useState([])
  const [conseilResultsData, setConseilResultsData] = useState([])
  const [conseilStats, setConseilStats] = useState([{benefice: 0, nbparis: 1}])
  const [upcomingData, setUpcomingData] = useState(pronosData);
  const [buttonText, setButtonText] = useState("Show all games");
  const [stake, setStake] = useState(100);

  var teamPicture = require('./teamPicture.json');
  //api calls to get data for conseil api
  React.useEffect(() => { 
    // fire only one on mount up
    fetch("/api")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        data.forEach((prono)=>{
          let pronoDate = new Date(prono.date);
          let plus1Date = pronoDate.setDate(pronoDate.getDate() +1)
          prono.date = new Date(plus1Date);
          prono.date = prono.date.toISOString().substr(0, 10)
          prono.homeImgUrl = teamPicture[prono.HomeTeam]
          prono.awayImgUrl = teamPicture[prono.AwayTeam]
          if (prono.prono == -1){
            prono.prono = "X2"
          }
          else{
            prono.prono = "1"
          }
        })
        setPronosData(data);
        setUpcomingData(data);
      });
  }, []);

  //fetch all prono (not only conseil)
  React.useEffect(() => { 
    // fire only one on mount up
    fetch("/apiAll")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        data.forEach((prono)=>{
          let pronoDate = new Date(prono.date);
          let plus1Date = pronoDate.setDate(pronoDate.getDate() +1)
          prono.date = new Date(plus1Date);
          prono.date = prono.date.toISOString().substr(0, 10)
          prono.homeImgUrl = teamPicture[prono.HomeTeam]
          prono.awayImgUrl = teamPicture[prono.AwayTeam]
          if (prono.prono == -1){
            prono.prono = "X2"
          }
          else{
            prono.prono = "1"
          }
        })
        setAllPronosData(data);
      });
  }, []);

  // api calls to get results on conseils (2nd table)
  React.useEffect(() => { 
    // fire only one on mount up
    fetch("/conseilResults")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        data.forEach((prono)=>{
          let pronoDate = new Date(prono.date);
          let plus1Date = pronoDate.setDate(pronoDate.getDate() +1)
          prono.date = new Date(plus1Date);
          prono.date = prono.date.toISOString().substr(0, 10)
          prono.homeImgUrl = teamPicture[prono.HomeTeam]
          prono.awayImgUrl = teamPicture[prono.AwayTeam]
          if (prono.prono === prono.resultat){
            if (prono.prono == -1){
              prono.resultat = Math.round(stake*(prono.OD_DRAW_OR_AWAY-1)*100)/100
            }
            else{
              prono.resultat = Math.round(stake*(prono.ODD_HOME-1)*100)/100
            }
          }
          else if (prono.gain>0){
            prono.resultat = Math.round(stake*(prono.gain)*100)/100
          }
          else{
            prono.resultat = -1*stake
          }
          if (prono.prono == -1){
            prono.prono = "X2"
          }
          else{
            prono.prono = "1"
          }
        })
        setConseilResultsData(data);
      });
  }, [stake]);

  // fetch conseil stats for total benef and roi
  React.useEffect(() => { 
    // fire only one on mount up
    fetch("/conseilStats")
      .then((res) => res.json())
      .then((data) => {
        setConseilStats(data);
      });
  }, []);

  const columns = React.useMemo(() => [
    {
      Header: "Date",
      accessor: 'date'
    },
    {
      Header: "Home Team",
      accessor: 'HomeTeam',
      Cell: AvatarCell,
      imgAccessor: "homeImgUrl"
    },
    {
      Header: "Away Team",
      accessor: 'AwayTeam',
      Cell: AvatarCell,
      imgAccessor: "awayImgUrl"
    },
    {
      Header: "odd Home",
      accessor: 'ODD_HOME',
    },
    {
      Header: "Double Chance ",
      accessor: 'OD_DRAW_OR_AWAY'
    },
    {
      Header: "Predicted Outcome",
      accessor: 'prono'
    },
    {
      Header: "Confidence",
      accessor: 'confidence',
      Cell: StatusPill
    },
  ], [])

  const resultColumns = React.useMemo(() => [
    {
      Header: "Date",
      accessor: 'date'
    },
    {
      Header: "Home Team",
      accessor: 'HomeTeam',
      Cell: AvatarCell,
      imgAccessor: "homeImgUrl"
    },
    {
      Header: "Away Team",
      accessor: 'AwayTeam',
      Cell: AvatarCell,
      imgAccessor: "awayImgUrl"
    },
    {
      Header: "odd Home",
      accessor: 'ODD_HOME',
    },
    {
      Header: "Double Chance ",
      accessor: 'OD_DRAW_OR_AWAY'
    },
    {
      Header: "Predicted Outcome",
      accessor: 'prono'
    },
    {
      Header: "Result",
      accessor: 'resultat',
      Cell: BenefPill
    },
  ], [])
  const data = React.useMemo(() => getData(), [])
  console.log(conseilStats)
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="" style={{ display: "flex", justifyContent: "space-between" }}>
          <h1 className="text-xl font-semibold"> Upcoming games </h1>
          <Button variant="outlined" onClick={() => {
              if (buttonText === "Show all games"){
                setUpcomingData(allPronosData);
                setButtonText("Show selected tips only")
              }
              else{
                setUpcomingData(pronosData);
                setButtonText("Show all games");
              }
                
                console.log(data)
              }}>{buttonText}</Button>
        </div>
        <div className="mt-6">
          <Table columns={columns} data={upcomingData} />
        </div>
        <div className="" style={{ display: "flex", justifyContent: "space-between" }}>
          <text className="text-xl font-semibold"> Past predictions </text>
          <div>
            <text>Stake </text>
            <input
                type="number"
                min={10}
                max={10000000}
                step={1}
                value={stake}
                onChange={e => setStake(e.target.value)}
                style={{width: "30%"}}
              />
          </div>
          <div>
            <text>Benefits </text>
            <BenefPill value={Math.round(stake*conseilStats[0].benefice*100)/100}/>
          </div>
          <div>
            <text>ROI </text>
            <BenefPill value={Math.round(100*100*conseilStats[0].benefice/conseilStats[0].nbparis)/100}/>
          </div>
        </div>
        <div>
          <Table columns={resultColumns} data={conseilResultsData} />
        </div>
      </main>
    </div>
  );
}

export default App;

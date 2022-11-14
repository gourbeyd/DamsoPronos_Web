const express = require('express');
const app = express();
// serve up production assets
const path = require('path');
const mysql = require('mysql');
// laod connection info
const { host, user, password } = require('./conf.js');

const db = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database : "damsopronos_db"
  });

db.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
    
});

var teamPicture = require('./teamPicture.json');

// let the react app to handle any unknown routes 
// serve up the index.html if express does'nt recognize the route

app.use(express.static(path.join(__dirname, './client/build')));

app.get("/api", (req, res) => {
    //res.json({ message: "Hello from server!" });
    db.query("select date, HomeTeam, AwayTeam, prono, ODD_HOME, OD_DRAW_OR_AWAY, confidence, conseil from PRONOS join MATCHS on PRONOS.id = MATCHS.id where resultat is NULL and conseil = 1 order by conseil desc, date asc, confidence desc", function (err, result) {
        if (err) throw err;
        let conseil = Object.values(JSON.parse(JSON.stringify(result)))
        for (key in conseil) {
            conseil[key].homeImgUrl = teamPicture[conseil[key].HomeTeam]
            conseil[key].awayImgUrl = teamPicture[conseil[key].AwayTeam]
          }
        res.send(conseil);
      });
})

app.get("/apiAll", (req, res) => {
    //res.json({ message: "Hello from server!" });
    db.query("select date, HomeTeam, AwayTeam, prono, ODD_HOME, OD_DRAW_OR_AWAY, OD_AH2, confidence, conseil from PRONOS join MATCHS on PRONOS.id = MATCHS.id where resultat is NULL order by conseil desc, date asc, confidence desc", function (err, result) {
        if (err) throw err;
        let conseil = Object.values(JSON.parse(JSON.stringify(result)))
        for (key in conseil) {
            conseil[key].homeImgUrl = teamPicture[conseil[key].HomeTeam]
            conseil[key].awayImgUrl = teamPicture[conseil[key].AwayTeam]
          }
        res.send(conseil);
      });
})

app.get("/conseilResults", (req, res) => {
    //res.json({ message: "Hello from server!" });
    db.query("select date, HomeTeam, AwayTeam, prono, resultat, ODD_HOME, OD_DRAW_OR_AWAY, OD_AH2, gain, confidence, conseil, FTHG, FTAG from PRONOS join MATCHS on PRONOS.id = MATCHS.id where not(resultat is NULL) and (conseil=1 or conseil=2 or conseil=3 or conseil=4) order by date desc, confidence desc", function (err, result) {
        if (err) throw err;
        
        conseilResults = Object.values(JSON.parse(JSON.stringify(result)))
        for (key in conseilResults) {
            conseilResults[key].homeImgUrl = teamPicture[conseilResults[key].HomeTeam]
            conseilResults[key].awayImgUrl = teamPicture[conseilResults[key].AwayTeam]
          }
        res.send(conseilResults);
      });
})

app.get("/conseilStats", (req, res) => {
    //res.json({ message: "Hello from server!" });
    db.query("SELECT x.benefice, x.nbparis, y.nbWon FROM (select sum(gain) as benefice, count(*) as nbparis from PRONOS join MATCHS on MATCHS.id = PRONOS.id where (conseil=1 or conseil=2 or conseil=4 or conseil=3) and not(resultat is NULL)) as x, (SELECT count(*) as nbWon FROM PRONOS where (conseil=1 or conseil=2 or conseil=3 or conseil=4) and gain>0 ) as y; ", 
        function (err, result) {
            if (err) throw err;
            res.send(JSON.parse(JSON.stringify(result)));
        });
})


app.get("/api/stats", (req, res) => {
    var statsData={
            benefice: 0,
            bankroll: [],
            roi: 0,
            pourcentage_reussite: 0
        }

    var promises=[];
    promises.push(new Promise(function(resolve, reject){
        db.query("select sum(gain) as benefice, count(*) as nbparis from PRONOS join MATCHS on MATCHS.id = PRONOS.id where resultat is not NULL and MATCHS.date >= '2022-08-03' and ((prono = -1 and OD_DRAW_OR_AWAY>=1.3 and OD_DRAW_OR_AWAY<3 ) or(prono=1 and ODD_HOME<3 and ODD_HOME>=1.3)); ", function (err, result) {
            if (err) throw err;
            if (result[0].benefice){
                statsData.benefice=result[0].benefice;
            }
            if (result[0].nbparis){
                statsData.roi=(result[0].benefice/result[0].nbparis)*100;
            }
            resolve(result);
          });
    }));

    promises.push(new Promise(function(resolve, reject){
        db.query("select sum(gain) as benefice from PRONOS join MATCHS on MATCHS.id = PRONOS.id where MATCHS.date >= '2022-08-03' and ((prono = -1 and OD_DRAW_OR_AWAY>=1.3 and OD_DRAW_OR_AWAY<3 ) or(prono=1 and ODD_HOME<3 and ODD_HOME>=1.3)); ", function (err, result) {
            if (err) throw err;
            if (result[0].benefice){
            statsData.benefice=result[0].benefice;}
            resolve(result);
          });
    }));

    promises.push(new Promise(function(resolve, reject){
        db.query("select (count(*)) as nbreussis, (select (count(*)) from PRONOS join MATCHS on PRONOS.id=MATCHS.id where (resultat is not NULL and ((prono = -1 and OD_DRAW_OR_AWAY>=1.3 and OD_DRAW_OR_AWAY<3 ) or(prono=1 and ODD_HOME<3 and ODD_HOME>=1.3)) and date>'2022-08-03' )) as nbpronos from PRONOS join MATCHS on PRONOS.id=MATCHS.id where (resultat is not NULL and prono = resultat and ((prono = -1 and OD_DRAW_OR_AWAY>=1.3 and OD_DRAW_OR_AWAY<3 ) or(prono=1 and ODD_HOME<3 and ODD_HOME>=1.3)) and date>'2022-08-03');", function (err, result) {
            if (err) throw err;
            if (result[0].nbpronos){
                statsData.pourcentage_reussite=(result[0].nbreussis/result[0].nbpronos)*100;
                }
            resolve(result);
          });
    
    }));
    var date = new Date();
    var date_limite= new Date('08/03/2022');
    while(date > date_limite){
        date.setDate(date.getDate() -1);
        var stringDate = date.getFullYear()+"-"+(date.getMonth()+1).toString()+'-'+date.getDate();
        //do promises push and add result to statsData
        
        promises.push(new Promise(function(resolve, reject){
            var cur_stringDate = new String(stringDate);
            var request = "select sum(gain) as benefice from PRONOS join MATCHS on PRONOS.id=MATCHS.id where (((prono = -1 and OD_DRAW_OR_AWAY>=1.3 and OD_DRAW_OR_AWAY<3 ) or(prono=1 and ODD_HOME<3 and ODD_HOME>=1.3)) and date>='2022-08-03' and date<='"+stringDate+"');";
            db.query(request, function (err, result) {
                if (err) throw err;
                statsData.bankroll.push({date: cur_stringDate, value: result[0].benefice});
                resolve(result);
              });
            }));
            
        }
    

    Promise.all(promises).then((values)=>{
        res.json(statsData);
    });
})


app.get("/apiGame/*", (req, res) => {
    let gameId = req.params['0']
    //regex to validate format 

    db.query("SELECT * from MATCHS JOIN PRONOS on MATCHS.id=PRONOS.id where MATCHS.id="+db.escape(gameId), 
        function (err, result) {
            if (err) throw err;
            res.send(JSON.parse(JSON.stringify(result)));
        });
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    ;});

const PORT = process.env.PORT || 8100;
console.log('server started on port:',PORT);
app.listen(PORT, process.env.IP, function(){
    console.log("app started !")
});

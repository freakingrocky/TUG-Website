import React, { useState, useEffect } from 'react';
import './App.scss'
import { db } from './firebase-config'
import { addDoc, collection, query, where, getDocs, Timestamp, updateDoc, doc as FirebaseDocument, deleteField } from 'firebase/firestore';
import Moment from 'moment';
import { useTranslation } from "react-i18next";
import i18next from 'i18next';
import CN_AUDIO from './audio/CN_1.mp3'
import ENG_AUDIO from './audio/ENG_1.mp3'
import useSound from "use-sound";
import {Link} from 'react-router-dom'

function App() {
  const { t } = useTranslation()
  const params = new URL(window.location.href).searchParams;

  const [playCN: playSound] = useSound(CN_AUDIO)
  const [playENG: playSound] = useSound(ENG_AUDIO)

  const [seconds, setSeconds] = useState(0);
  const [ti, setTi] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [label, setLabel] = useState("Start");
  const [time, setTime] = useState(0);
  const [labelClass, setLabelClass] = useState("time_stuff");
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [style, setStyle] = useState('timer__container__start');
  const [timetaken_c1, setTimetaken_c1] = useState("0");
  const [username, setUsername] = useState(params.get('__name'));
  const [allowed, setAllowed] = useState(true);
  const [s, setS] = useState(false);
  const [countdown, setCountdown] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [uid, setUid] = useState(params.get('__user'));
  const [infoTxt, setInfoTxt] = useState(t('按制開始'));

  var TmpID = Moment().format('lll').toString()
  if (username) {TmpID += username.toString()}

  Moment.locale('zh-hk');

  const usersCollectionRef = collection(db, "uid_users")
  useEffect(() => {
    const getUsers = async () => {
      const q = query(usersCollectionRef, where("uid", "==", uid));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // console.log(doc.id, " => ", doc.data());
        setUsername(doc.data().name);
        if (params.get('__name') != doc.data().name) {
          setUid(null);
          setUsername('Unknown')
        }
      })
    };
    getUsers();
  }, []);

  const DataCollectionRef = collection(db, "TUG_stopwatch")
  useEffect(() => {
    const getLatest = async () => {
      const q = query(DataCollectionRef, where("uid", "==", uid));

      var latest = new Timestamp (0)
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        if (doc.data().time > latest) {
          latest = doc.data().time;
        }
        if (Timestamp.now().toMillis() - latest.toMillis() < 2.16e+7) {
          setAllowed(false)
        }
        if (latest == new Timestamp (0)) {
          setAllowed(true)
        }
      })
      // console.log("Latest", latest.toMillis())
      // console.log("Now", Timestamp.now().toMillis())
      // console.log("Diff:", Timestamp.now().toMillis() - latest.toMillis())
      // console.log(3.6e+7)
    };
    getLatest();
  }, [])

  useEffect(() => {
    setInfoTxt(t('按制開始'))
  }, [])

  useEffect(async() => {
    setCurrentTime(new Date().toLocaleString());
    // if (time == 0) {
    //   i18next.changeLanguage('cn');}
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // if (!allowed) {
    //   setTime(2)
    //   setTi(2)
    //   setLabel("Atleast a 10hr gap is required.")
    //   setStyle('timer__container__stop')
    //   return
    // }
    if (isRunning) {
        if (time == 1) {
          // await delay(4000);
          setInfoTxt(t('FT'))
          setInitialTime(new Date().getTime())
          setTi(2)
          setStyle('timer__container__start')
          if (!s) {
            setS(true)
            setIsRunning(false)
            return
          }
        }
        if (time < 2) {
          setCountdown(true);
          setSeconds(3)
          setInfoTxt('');
          setLabel('')
          if (ti != 0) { setInfoTxt(t('CD')) } else { setInfoTxt(t('按制開始'))}
          var times = 0;
          const identifier = window.setInterval(function () {
            times += 1;
            if (times == 3) {
              setSeconds(t('Go'));  }
            else if (times == 4) { window.clearInterval(identifier); setInfoTxt(t('CD')); }
            else { setSeconds(seconds => seconds - 1); }
          }, 1000);

          await delay(4000);
          setCountdown(false);
          setInfoTxt(t('FT'));
          const id = window.setInterval(() => {
          // setSeconds(seconds => seconds + 1);
          setSeconds((((new Date().getTime()) - initialTime - 4000) / 1000).toFixed(2))
        }, 10);
        setIntervalId(id);
        setTime(time => time + 1)
          if (ti != 2) { setTi(ti => ti + 1)}
        setStyle('timer__container__stop');
        setLabel("Stop")
        }
    } else {
      window.clearInterval(intervalId);
      if (ti == 1) { setLabel("Again")
      } else { setLabel("Start") }
      if (time == 1) {
        if (timetaken_c1 == '0') {
          setTimetaken_c1(seconds)
          setInfoTxt(t('IT_1'));

          async function AddData_1() {
            await addDoc(collection(db, "TUG_stopwatch"), {
              name: username,
              tmp_id: TmpID,
              time: Timestamp.now(),
              timetaken_c1: seconds,
              timetaken_c2: 'Not Attempted',
              Time_fmt: Moment().format('lll'),
              Time_fmt_2: 'Not Attempted',
              uid: uid
            })

          }
          // console.log("sec", sec)
          // console.log("tt", timetaken_c1)
          if (username != "Unknown") { AddData_1() }
        }
      }
      if (time == 2) {
        setStyle('timer__container__comp');
        setLabel("Complete")
        setInfoTxt(t("Done"))
        setLabelClass("time_stuff_comp")
        // console.log("TT:", timetaken_c1)
        // console.log("Seconds:", sec)
        setInfoTxt(t('IT_2'));
        async function AddData() {
          const q = query(DataCollectionRef, where("tmp_id", "==", TmpID));
          const querySnapshot = await getDocs(q);
          var docRef = ""
          querySnapshot.forEach(async function (doc) {
            if (doc.data().uid == uid)  {
              docRef = FirebaseDocument(db, "TUG_stopwatch", doc.id)}
          });
          await updateDoc(docRef, {
          timetaken_c2: seconds,
          uid: uid,
          Time_fmt_2: Moment().format('lll'),
          tmp_id: deleteField()
        })
          setFeedback("")}
        if (username != "Unknown")
        { AddData() }
      }
    }
  }, [isRunning]);

  async function addFeedback(e) {
    e.preventDefault();
      await addDoc(collection(db, "feedback"), {
        name: username,
        time: Timestamp.now(),
        time_fmt: Moment().format('lll'),
        uid: uid,
        feedback: document.getElementById('feedback').value
      })
    .then(() => {
      alert("Feedback Submitted!")
      setFeedback("")
    })}
  // console.log(document.getElementById('feedback').value)
  // console.log(username)
  // console.log(initial)

  return (
    <div className="overall">
      <div className="container">
        <div className="trans-container">
          <p className="userData"> {username} | {uid} | {currentTime}</p>
          <div className="trans_btn">
          <button className="btn btn-outline-danger" style={{ width: '60vw', padding: '0px' }}
            onClick={() => {if (i18next.language == 'cn') {i18next.changeLanguage('en')}
            else { i18next.changeLanguage('cn') }}}>{t("Loading")}</button>
          </div></div>
        <div className="headline">
        <h1 className="centered">{t('Time Up and Go Test')}</h1>
        {/* <p>Hello {username}</p> */}
        <Link to={"/analytics/?__user=" + uid + "&__name=" + username} target="_blank" rel="noreferrer" ><p className="centered__link" >{t('VIDEO TUTORIAL LINK')}</p></Link>
          <p className="tut_txt">{t('tut_txt')}</p></div>
        <p className="tut_txt">{infoTxt}</p>
      </div>
      <div className="app">
        <div className={style} onClick={() => {
          if (!countdown) {if (isRunning) { setIsRunning(false)
          } else { setIsRunning(true); setInitialTime(new Date().getTime()); if (i18next.language == 'cn' && label == 'Start' && allowed) { playCN() } else if (label == 'Start' && allowed) { playENG() }}}
        }}>
          <div className="time" >
            <div className={labelClass}>
              {t(label)}
            </div>
            {seconds}
            <div className="time_stuff">
              {t("Exercise")}: {ti}
            </div>
          </div>
        </div>
        <button className="btn btn-danger" style={{ padding: '2px', width: '50vw', margin: '14px', fontSize: '32px' }} onClick={() => {
          setIsRunning(false);
          setSeconds(0);
          setTime(0);
          setTi(0);
          setLabelClass("time_stuff");
          setStyle("timer__container__start")
          setLabel("Start");
          setS(false);
          setCountdown(false);
          setInfoTxt(t('按制開始'));
          setAllowed(true);
        }} disabled={time == 0 || countdown} >{t("Reset")}</button>
      </div>
      <div className="feedback">
        <h3 style={{fontSize: '1.4rem'}}><u>{t("Feedback")}</u></h3>
        <form onSubmit={addFeedback}>
          <div className="form-group" style={{width: '60vw'}}>
            <textarea className="form-control" id="feedback" rows="3" placeholder={t("Feedback")} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-dark mb-2" style={{ width: '60vw' }}
            disabled={username == "Unknown"}>{t("Submit")}</button>
        </form>
      </div>
      {/* <button onClick={() => { i18n.changeLanguage('cn')}}>Test</button> */}
    </div>
  );
}

export default App;

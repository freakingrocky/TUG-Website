import React, { useState, useEffect } from 'react';
import Moment from 'moment';
import './App.scss'
import { useTranslation } from "react-i18next";
import i18next from 'i18next';
import { db } from './firebase-config'
import { collection, orderBy, query, where, getDocs } from 'firebase/firestore';
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import {Link} from 'react-router-dom'


function App() {
    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
        Filler
    )

    const { t } = useTranslation()
    const params = new URL(window.location.href).searchParams;
    const [username, setUsername] = useState(params.get('__name'));
    const [uid, setUid] = useState(params.get('__user'));
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
    const [dataOK, setDataOK] = useState(false)
    const [dates_arr, setDates] = useState([])
    const [times_arr, setTimes] = useState([])
    const [perDays, setPerDays] = useState([])
    var data = [];


    Moment.locale('zh-hk');

    const usersCollectionRef = collection(db, "uid_users")
    const DataCollectionRef = collection(db, "TUG_stopwatch")
    useEffect(() => {
        setCurrentTime(new Date().toLocaleString());
        const getUsers = async () => {
            const q = query(usersCollectionRef, where("uid", "==", uid));

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                setUsername(doc.data().name);
                if (params.get('__name') != doc.data().name) {
                    setUid(null);
                    setUsername('Unknown')
                }
            })
        };
        getUsers();
    }, []);

    useEffect(async () => {
        const getData = async () => {
            const q = query(DataCollectionRef, where("uid", "==", uid), orderBy("time"));

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                data.push(doc.data());
                })
        }
        await getData();
        if (data.length >= 7)
            {
            setDataOK(true);
            var times = [];
            var dates = [];
            var final_times = [];
            var final_dates = [];
            var times_per_day = []
                for (let index = 0; index < data.length; index++) {
                    try { times.push(parseFloat(data[index].timetaken_c1) + parseFloat(data[index].timetaken_c2)) }
                    catch (e) {
                        try { times.push(parseFloat(data[index].timetaken_c1)) }
                        catch (e2) {console.log(e2)}
                    }
                    if (times.length == index + 1) {
                        dates.push(data[index].Time_fmt.slice(0, -8))
                    }
                }
                try
                {
                var currDate = '';
                var timeAvg = 0;
                var count = 0;
                for (let i = 0; i < times.length; i++) {
                    if (i == 0) {
                        currDate = dates[i];
                        timeAvg = times[i];
                        count = 1;
                    }
                    if ((currDate != dates[i] | i == (times.length - 1)) && i != 0)
                    {
                        final_dates.push(currDate)
                        final_times.push(timeAvg / count)
                        times_per_day.push(count)
                        currDate = dates[i];
                        timeAvg = times[i];
                        count = 1;
                    }
                    else
                    {
                        timeAvg += times[i];
                        count++;
                    }
                }
                const mean = final_times.reduce((a, b) => a + b) / final_times.length;
                const sd = Math.sqrt(final_times.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / final_times.length);
                for (let i = 0; i < final_times.length; i++) {
                    if (final_times[i] > (1.4 * sd) + mean | final_times[i] < mean - (1.4 * sd)) {
                        final_times.splice(i, 1)
                        final_dates.splice(i, 1)
                    }
                }}
                catch (e) { console.log(e)}
                // if (final_times.length < 7) {setDataOK(false)}
            }
            var fin_d = []
            var fin_t = []
            var fin_td = []
            for (let i = 0; i < final_times.length; i++) {
                if (i != 0)
                {
                    var pushed = false
                    if ((((final_dates[i].slice(0, 4)) != (final_dates[i - 1].slice(0, 4)) && ((parseInt(final_dates[i].slice(4, 6) != 30) | (parseInt(final_dates[i].slice(4, 6) != 31)))))) | (parseInt(final_dates[i].slice(4, 6) - 1) != (parseInt(final_dates[i-1].slice(4, 6)))) && (final_dates[i].slice(0, 3) == final_dates[i-1].slice(0, 3)))
                    {
                        if (i == final_dates.length - 1)
                        {pushed = true;}
                        const first = parseInt(final_dates[i - 1].slice(4, 6)) + 1
                        var last = 30
                        if ((parseInt(final_dates[i].slice(4, 6) != 30)) | (parseInt(final_dates[i].slice(4, 6) != 31)))
                        {
                            last = 30
                        }
                        else
                        {
                            last = parseInt(final_dates[i].slice(4, 6))

                        }
                        const date_fmt = (final_dates[i].slice(0, 4))
                        const date_fmt_second = (final_dates[i].slice(final_dates[i].length - 6, final_dates[i].length))
                        var tssd = final_times[i-1] + final_times[i]
                        for (let j = 0; j < last - first + 1; j++) {
                            const date_fmt_new = date_fmt + (first + j).toString() + date_fmt_second
                            // console.log(date_fmt_new)
                            const time_new = (tssd) / (j + 2)
                            tssd += time_new
                            fin_t.push(time_new)
                            fin_d.push(date_fmt_new)
                            fin_td.push(0)
                        }
                    }
                else {
                    fin_t.push(final_times[i])
                    fin_d.push(final_dates[i])
                    fin_td.push(times_per_day[i])
                }
                } else {
                    fin_t.push(final_times[i])
                    fin_d.push(final_dates[i])
                    fin_td.push(times_per_day[i])
                }
            if (i == (final_times.length - 1) && !pushed) {
                fin_t.push(final_times[i])
                fin_d.push(final_dates[i])
                fin_td.push(times_per_day[i])
            }
            }

            setDates(fin_d);
            setTimes(fin_t);
            setPerDays(fin_td)
            return (null)
    }, [])

    // console.log(data)
    return (
        <div className="overall">
            <div className="container">
                <div className="trans-container">
                    <p className="userData"> {username} | {uid} | {currentTime}</p>
                    <div className="trans_btn">
                        <button className="btn btn-outline-danger" style={{ width: '60vw', padding: '0px' }}
                            onClick={() => {
                                if (i18next.language == 'cn') { i18next.changeLanguage('en') }
                                else { i18next.changeLanguage('cn') }
                            }}>{t("Loading")}</button>
                    </div></div>

                <div className="headline">
                    <Link to={"/?__user=" + uid + "&__name=" + username} target="_blank" rel="noreferrer" ><p className="centered__link" >{t('Back Link')}</p></Link>
                    <h1 className="centered">{t('Time Up and Go Test')}</h1>
                </div>
            </div>
                {dataOK ? <div className="graphs-container">
                    <Line
                        data={{
                            labels: dates_arr,
                            datasets: [{
                                data: times_arr,
                                label: 'Time (in seconds)',
                                backgroundColor: 'rgba(244, 20, 20, 0.8)',
                                borderColor: 'rgba(144, 80, 20, 0.6)',
                                borderWidth: '2',
                                tension: 0.3,
                                fill: false,
                                pointRadius: 6,
                                yAxisID: 'y'
                            },
                            // {
                            //     data: perDays,
                            //     label: 'Times Complete Per Day',
                            //     backgroundColor: 'rgba(20, 244, 20, 0.8)',
                            //     borderColor: 'rgba(80, 144, 20, 0.6)',
                            //     borderWidth: '0.8',
                            //     // tension: 0.1,
                            //     fill: false

                            // }
                        ]
                        }}
                        // height={1400}
                        // width={600}
                        options={{
                            responsive: true,
                            indexAxis: 'x',
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    // grid: {
                                    //     display: false,
                                    //     color: 'rgba(255, 255, 255, 0)'
                                    // },
                                    title : { display: true, text: 'Time (in Seconds)',
                                        font: {
                                            weight: 'bold',
                                            size: 15,
                                        }
                                },
                                    labels: ['Jun 1, 2022', 'Jun 2, 2022', 'Jun 3, 2022', 'Jun 4, 2022'],
                                    beginAtZero: true,
                                    min: 0,
                                    ticks: {
                                        beginAtZero: true,
                                        min: 0
                                    },
                                    display: true,
                                },
                                x: {
                                    // grid: {
                                    //     display: false,
                                    //     color: 'rgba(255, 255, 255, 0)'
                                    // },

                                    title: { display: true, text: 'Dates',
                                        font: {
                                            weight: 'bold',
                                            size: 15
                                        }
 },
}
                                }
                        }}
                        />
                </div> :
                <div>
                    <div className="headline">
                        <h1 className="centered">{t('NR')}</h1>
                    </div>
                </div>}
        </div>
    )
}

export default App;

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { authUser } from '../_actions/user_actions';
import { useDispatch } from "react-redux";
import Loader from "../components/commons/Loader";
import { useAlert } from "react-alert";
import {isMobile, isSafari} from "react-device-detect";

export default function (SpecificComponent, option) {
    function AuthenticationCheck(props) {

        const [user, setUser] = useState(null)
        const [loading, setLoading] = useState(false)
        const dispatch = useDispatch();
        const alert = useAlert();

        const io = require('socket.io-client');
        const socket = io();

        let count = 0;

        useEffect(() => {

            //To know my current status, send Auth request 
            dispatch(authUser()).then(response => {

                console.log(response);

                setLoading(false);
                setUser(response.payload);

                //Not Loggined in Status 
                if (!response.payload.isAuth) {
                    if (option === true) {
                        props.history.push('/login');
                    }
                //Loggined in Status 
                } 
                else {

                    // redirect to home
                    if (option === false) {
                        props.history.push('/home')
                    }

                    localStorage.setItem("my_firstname", response.payload.firstname || "");
                    localStorage.setItem("my_lastname", response.payload.lastname || "");
                    localStorage.setItem("affiliation", response.payload.affiliation || "");
                    localStorage.setItem("keywords", response.payload.keywords || "");
                    
                    // show alert if there is no other info
                    if (!response.payload.affiliation || !response.payload.keywords || !response.payload.image) {
                        alert.show("Please click on settings (on the top right corner) to edit your information shown to the others");
                    }

                    // reconnection and disconnection
                    socket.on("reconnect", () => {
                        alert.show("Successfully reconnected");
                    })
        
                    socket.on("clientDisconnect", (data) => {
                        count += 1;
                        console.log("disconnected", count);
                        if (count === 1) {
                            alert.show('Disconnected. Please refresh your browser if it does not reconnect automatically.')
                        }
                        else if (count === 4) {
                            // window.location.reload();
                            count = 0;
                        }
                    });
                }

                if (isMobile && !isSafari) {
                    alert.show("The recommended browser on iOS systems is Safari.");
                }
                
                
            })

        }, [])

        return (
            <div>
                <SpecificComponent {...props} currentUser={user} socket={socket}/>
                {loading ? <Loader/> : ""}
            </div>
        )
    }
    return AuthenticationCheck
}


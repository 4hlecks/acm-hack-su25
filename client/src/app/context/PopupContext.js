"use client"
import React, {createContext, useContext, useState} from 'react';
import {useRouter} from 'next/navigation';

const PopupContext = createContext();

export function PopupProvider({children}){
    // Popup state
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const router = useRouter();

    const openEventPopup = (event) => {
        console.log('Opening popup with event:', event);
        setSelectedEvent(event);
        setIsPopupOpen(true);
    };

    const closeEventPopup = () => {
        setSelectedEvent(null);
        setIsPopupOpen(false);
    };

    const handleClubSelect = (club) => {
        router.push(`/profile-page/${club._id}`);
    }

    return (
        <PopupContext.Provider value={{
            selectedEvent,
            isPopupOpen,
            openEventPopup,
            closeEventPopup,
            handleClubSelect
        }}>
            {children}
        </PopupContext.Provider>
    )
}

export function usePopup(){
    const context = useContext(PopupContext);
    if (!context){
        throw new Error('usePopup must be used within a PopupProvider');
    }
    return context;
}
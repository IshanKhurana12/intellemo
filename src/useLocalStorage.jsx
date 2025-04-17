import React, { useEffect, useState } from 'react'

const useLocalStorage = (key,value) => {
    const [storedValue,setStoredValue]=useState(()=>{
        try {
            //get the current value of the tasks from localstorage 
            //if not there return initial value
            const currentValue=localStorage.getItem(key);
            return currentValue ? JSON.parse(currentValue) : value;
        } catch (error) {
            console.log(error);
            return value;
        }
        
        
    })

    //add the changes made to initial value on change of key and stored values
    useEffect(()=>{
        try {
            localStorage.setItem(key,JSON.stringify(storedValue));
        } catch (error) {
            console.log(error);
        }
    },[key,storedValue]);
    
    return [storedValue,setStoredValue];

}

export default useLocalStorage
import { TelegramWebApps } from 'telegram-webapps-types';
import {useEffect, useState} from "react";

const fakeUser = {
    first_name: "",
    last_name: "",
    username: 'whambywham',
    id: 111125293
}


function useTelegramInitData() {
    const [data, setData] = useState<TelegramWebApps.WebAppInitData>({});

    useEffect(() => {
        setData({
            user:fakeUser,
            start_param: "hD8PaTFKnFuKokpEWLWkpH"
        });
    }, []);

    return data;
}


export default useTelegramInitData;
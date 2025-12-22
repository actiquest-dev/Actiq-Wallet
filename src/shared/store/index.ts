import { ICard, IPayout, IUser, TelegramUser, IApp, appStateDefault } from '@/db/schema'

class appState {
    static instance = null
    isInited = false
    state = {
        inited: false,
        user: { balance: 0, state: {}},
        config: { ratio_usd: 100 },
        tasksArray: [],
        payoutsArray: [],
        tasks: {},
        payouts: {},
    } as IApp

    static getInstance() {
        if (!this.instance) {
            this.instance = new appState();
        }
        return this.instance;
    }

    init = () => {
        if (this.isInited) return this.state
        else this.state = {
            inited: false,
            user: {
                id: null,
                first_name: "",
                last_name: "",
                username: null,
                balance: 0,
                state: {}
            },
            config: {
                ratio_usd_previous: 100,
                ratio_usd: 100
            },
            tasksArray: [],
            payoutsArray: [],
            tasks: {},
            payouts: {},
        } as IApp

        this.isInited= true
        return this.state;
    }

    getState = async () => {
        if (this.isInited) this.init()
        //console.log("Get state ", this.state)
        return this.state;
    }

    getStateSync = () => {
        //console.log("Get state Sync", this.state)
        return this.state;
    }

    setState = async (newState) => {
        if (this.isInited) this.init()
        this.state = newState
        //console.log("Set data", this.data)
        return this.state;
    }
}

//const otr = appState.getInstance();

export default appState.getInstance();
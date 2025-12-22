import { foreignKey, integer, doublePrecision, pgTable, serial, timestamp, varchar, text, jsonb } from "drizzle-orm/pg-core";
import {date} from "zod";

export const Users = pgTable('Users', {
    id: integer('id').primaryKey(),
    first_name: varchar('first_name'),
    last_name: varchar('last_name'),
    username: varchar('usernames'),
    balance: varchar('balance'),
    balance_on_hold: varchar('balance_on_hold'),
    state: jsonb('state'),
    avatar: text('avatar'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const Config = pgTable('Config', {
    id: integer('id').primaryKey(),
    key: varchar('key'),
    value: varchar('value'),
});

export const Transactions = pgTable('Transactions', {
    id: integer('id').primaryKey(),
    createdAt: timestamp('created_at').defaultNow(),
    from: integer('from'),
    to: integer('to'),
    value: doublePrecision('value'),
    source: text('source'),
});

export const Shares = pgTable('Shares', {
    id: integer('id').primaryKey(),
    createdAt: timestamp('created_at').defaultNow(),
    from: integer('from'),
    value: doublePrecision('value'),
    payout: doublePrecision('payout'),
    hash: text('hash'),
    status: text('status'),
    validTill: timestamp('valid_till').defaultNow()
});

export const Payouts = pgTable('Payouts', {
    id: integer('id').primaryKey(),
    name: text('name'),
    title: text('title'),
    description: text('description'),
    value: integer('value'),
    type: text('type'),
    as_card: integer('as_card'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const Tasks = pgTable('Tasks', {
    id: integer('id').primaryKey(),
    name: text('name'),
    title: text('title'),
    description: text('description'),
    payout: text('payout'),
    type: text('type'),
    cardType: text('card_type'),
    cardColor: text('card_color'),
    icon: text('icon'),
    data: jsonb('data'),
    ord: integer('ord'),
    state: integer('state'),
    help: text('help'),
    payout_text: text('payout_text'),
    createdAt: timestamp('created_at').defaultNow(),
});



export type IApp = {
    inited: boolean,
    user: IUser,
    config: [],
    tasksArray: ICard[],
    payoutsArray: IPayout[],
    tasks: Object,
    payouts: Object,
}

export const appStateDefault = {
    inited: false,
    user: { balance: 0, state: {}},
    config: { ratio_usd: 100 },
    tasksArray: [],
    payoutsArray: [],
    tasks: {},
    payouts: {},
}

export type IPayout = {
    id: number,
    name: string,
    title: string,
    description: string,
    value: number,
    type: string,
    as_card: number,
}

export type ICard = {
    id: number,
    name: string,
    title: string,
    description: string,
    payout: string,
    payoutObj: IPayout,
    type: string,
    card_color: string,
    icon: string,
    ord: number,
    state: number,
    help: string,
    payout_text: string
}

export type IUser = {
    id: number,
    first_name: string,
    last_name: string,
    username: string,
    balance: string,
    balance_on_hold: string,
    state: object,
    avatar: string
}

export type TelegramUser = {
    first_name: string,
    last_name: string,
    username: string,
    id: number
}

export type ITransaction = {
    id: number,
    createdAt: number,
    from: number,
    to: number,
    source: string,
    value: number,
}

export type IShare = {
    id: number,
    createdAt: string,
    from: number,
    hash: string,
    value: number,
    payout: number,
    status: string,
    validTill: date,
}

export type IShareH = {
    id: number,
    createdAt: string,
    from: number,
    hash: string,
    value: number,
    payout: number,
    status: string,
    validTill: date,
    fromObj: object
}


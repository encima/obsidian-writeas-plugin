// Writeas Docs https://developers.write.as/docs/api/#retrieve-a-post

import { requestUrl } from "obsidian";


export class WriteasClient {

    user: string;
    pass: string;
    token: string;

    constructor(user: string, pass: string) {
        this.user = user;
        this.pass = pass;
    }

    login() {
        return requestUrl({
            url: "https://write.as/api/auth/login",
            body: JSON.stringify({ alias: this.user, pass: this.pass }),
            method: "POST",
            headers: {
                "Content-Type": 'application/json'
            }
        }).catch((err) => {
            console.error(err);
            return;
        }).then((resp) => {
            let res = resp?.json['data']
            this.token = res['access_token']
        })
    }

    getCollections() {
        return requestUrl({
            url: "https://write.as/api/me/collections",
            method: "GET",
            headers: {
                "Content-Type": 'application/json',
                "Authorization": `Token ${this.token}`
            }
        }).catch((err) => {
            console.error(err);
            return;
        }).then((resp) => {
            let res = resp?.json['data']
            return res;
        })
    }

    getPost(post_id: string) {
        return requestUrl({
            url: `https://write.as/api/posts/${post_id}`,
            method: "GET",
            headers: {
                "Content-Type": 'application/json',
                "Authorization": `Token ${this.token}`
            }
        }).catch((err) => {
            console.error(err);
            return;
        }).then((resp) => {
            let res = resp?.json['data']
            return res;
        })
    }

    moveToCollection(collection: string, post_id: string) {
        return requestUrl({
            url: `https://write.as/api/collections/${collection}/collect`,
            body: JSON.stringify([{ id: post_id }]),
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                "Authorization": `Token ${this.token}`
            }
        }).catch((err) => {
            console.error(err);
            return;
        }).then((resp) => {
            let res = resp?.json['data']
            return res;
        })
    }

    publishPost(body: any, collection: string) {
        return requestUrl({
            url: `https://write.as/api/collections/${collection}/posts`,
            body: JSON.stringify(body),
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                "Authorization": `Token ${this.token}`
            }
        }).catch((err) => {
            console.error(err);
            return;
        }).then((resp) => {
            let res = resp?.json['data']
            return res;
        })

    }

    updatePost(body: any, post_id: string) {
        return requestUrl({
            url: `https://write.as/api/posts/${post_id}`,
            body: JSON.stringify(body),
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                "Authorization": `Token ${this.token}`
            }
        }).catch((err) => {
            console.error(err);
            return;
        }).then((resp) => {
            let res = resp?.json['data']
            return res;
        })

    }

}


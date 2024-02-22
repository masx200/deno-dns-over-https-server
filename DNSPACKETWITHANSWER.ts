export interface DNSPACKETWITHANSWER {
    answer: {
        "name": string;
        "type": number;
        "class": number;
        "ttl": number;
        "address": string;
    }[];
}

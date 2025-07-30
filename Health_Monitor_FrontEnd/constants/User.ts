export default interface User {
    id: number;
    name: string;
    email: string,
    password: string,
    phoneNumber: string, 
    online: boolean,
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
}
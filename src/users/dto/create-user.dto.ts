export class CreateUserDto 
{
    readonly fullName: string;
    readonly email: string;
    readonly phoneNumber: string;
    readonly password: string;
    readonly confirmPassword: string;
}

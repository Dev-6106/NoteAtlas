export type GoogleUserType = {
    id: String;
    displayName: String;
    name: {
        familyName: String;
        givenName: String;
    };
    emails: Array<{
        value: String;
        verified: Boolean;
    }>;
    photos: Array<{
        value: String;
    }>;
    provider: String;
    _json: {
        sub: string;
        name: string;
        given_name: string;
        family_name: string;
        picture: string;
        email:  string;
        email_verified: boolean;
    };
}
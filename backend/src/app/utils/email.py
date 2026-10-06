
def normalize_email(email: str) -> str:

    # lowercases everything and makes sure to take out stuff like whitespace
    email = email.strip().lower()

    # make sure that theres an @, if not its not really an email, just in case
    if "@" not in email:
        return email
    
    # make sure to split the email into the name before the email @ and the actual email @
    name, domain = email.split("@", 1)

    # check if its gmail or googlemail, if they are you apply different typa rules
    if domain in ("gmail.com", "googlemail.com"):

        # tkae out + and onyl return first
        name = name.split("+")[0]

        # remove dots, important since prof said that with dots it could count as the same basically
        name = name.replace(".", "")

        # googleemail and gmail will be the same 
        domain = "gmail.com"

    elif domain in("outlook.com", "hotmail.com", "live.com", "icloud.com", "me.com", "mac.com", "protonmail.com",):

        # for all these other domains, dots are valid, unlike gmail
        name = name.split("+")[0]

    else:
        # remove + for other domains but keep dots
        if "+" in name:
            name = name.split("+")[0]
    
    return f"{name}@{domain}"

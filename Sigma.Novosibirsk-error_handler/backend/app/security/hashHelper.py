from bcrypt import checkpw, hashpw, gensalt
class HashHelper(object):

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str):
        try:
            if checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8")):
                return True
        except ValueError:
            # Invalid/non-bcrypt hash in DB should not crash auth flow.
            return False
        return False
    
    @staticmethod
    def get_password_hash(plain_password: str):
        return hashpw(
            plain_password.encode("utf-8"),
            gensalt()
        ).decode('utf-8')

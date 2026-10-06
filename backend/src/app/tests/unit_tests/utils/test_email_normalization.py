# Tests for normalize_email utility
from app.utils.email import normalize_email


# Gmail tests, dots should be removed
def test_gmail_dots_stripped():
    # j.o.h.n and john are same
    assert normalize_email("j.o.h.n@gmail.com") == "john@gmail.com"


def test_gmail_single_dot_stripped():
    assert normalize_email("john.doe@gmail.com") == "johndoe@gmail.com"


def test_gmail_plus_suffix_stripped():
    # plus addressing: john+spam@gmail.com goes to john@gmail.com
    assert normalize_email("john+spam@gmail.com") == "john@gmail.com"


def test_gmail_dot_and_plus_combined():
    # both dot and plus should be handled together
    assert normalize_email("j.o.h.n+anything@gmail.com") == "john@gmail.com"


def test_googlemail_canonicalized_to_gmail():
    # googlemail.com is the same service as gmail.com
    assert normalize_email("john@googlemail.com") == "john@gmail.com"


# Other providers - keep their dots
def test_yahoo_keeps_dots():
    # yahoo treats dots as significant so dont strip
    assert normalize_email("john.doe@yahoo.com") == "john.doe@yahoo.com"


def test_outlook_strips_plus_keeps_dots():
    # outlook supports plus aliasing but keeps dots
    assert normalize_email("john.doe+work@outlook.com") == "john.doe@outlook.com"


def test_icloud_strips_plus_keeps_dots():
    # icloud supports plus aliasing
    assert normalize_email("john.doe+work@icloud.com") == "john.doe@icloud.com"


# Capitalization and whitespace
def test_capitalization_lowercased():
    # email is case insensitive in practice
    assert normalize_email("JOHN@GMAIL.COM") == "john@gmail.com"


def test_whitespace_stripped():
    # leading/trailing whitespace from copy paste should be removed
    assert normalize_email("  john@gmail.com  ") == "john@gmail.com"


# Unknown providers, only strip plus, leave everything else alone
def test_unknown_provider_only_strips_plus():
    # custom domains we dont know about should keep dots
    assert normalize_email("user.name+x@example.com") == "user.name@example.com"


def test_unknown_provider_no_plus_unchanged():
    # if no plus the email should pass through 
    assert normalize_email("user.name@example.com") == "user.name@example.com"



def test_malformed_email_returned_as_is():
    # if there's no @ we just return the input lowercased
    assert normalize_email("notanemail") == "notanemail"
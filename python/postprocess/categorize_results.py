from resources import constants as c
from resources.constants import ALL_WORDS
from resources.constants import TEMPLATE_WORDS
from resources.textbox import Textbox

def categorize(confident_results):
    """
    post-processing: categorize template text, digits, and remaining text
    
    input: array of tuples returned from easyOCR, to be formatted as Textbox objects
    output: three categories of data found
    - template: template words
    - digits: any text containing only integers/numbers
    - other: the "leftover" text after categorizing
    """
    template = {key: Textbox(entry=None) for key in ALL_WORDS}
    digits = []
    other = []

    for result in confident_results:
        template_entry = result[1].upper()
        if template_entry in TEMPLATE_WORDS:
            # expected template words
            template[template_entry] = Textbox(result)
        elif template_entry.isdigit():
            # other numbers text
            digits.append(Textbox(result))
        elif template_entry == c.FREE_PLAY or c.CREDITS in template_entry:
            # nothing of interest below the footer text on-screen
            template[c.FOOTER] = Textbox(result)
            break
        else:
            # uncategorized text
            other.append(Textbox(result))

    return (template, digits, other)
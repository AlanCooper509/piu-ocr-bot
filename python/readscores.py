# pip install easyocr==1.6.2
# pip install numpy==1.23.3

import easyocr
import json
import numpy as np
import os
import PIL
import requests
import sys
import urllib

# local imports
from preprocess import filter
from preprocess import rotation
from postprocess import categorizer
from resources import constants as c
from resources import params
from resources.textbox import Textbox

def post_process(results, debug=False):
    # defining the template to fill out during this function
    template = {key: Textbox(entry=None) for key in c.ALL_WORDS}

    # post-processing: remove low-confidence text
    confident_results = [result for result in results if result[2] > params.CONFIDENCE]
    
    # categorize remaining text results
    (template, digits, remaining_results) = categorizer.categorize_results(confident_results, template)
    
    # filter digits for score values using 1D projections of positions
    (score_numbers, remaining_digits) = categorizer.assign_digits(digits, remaining_results, debug)
    
    # match scores with their template word's values
    if len(c.SCORE_WORDS) <= len(score_numbers):
        for idx, word in enumerate(c.SCORE_WORDS):
            template[word].value = score_numbers[idx]
    
    # get chart name
    chart_name = categorizer.guess_chartname(remaining_results, remaining_digits, template)
    template[c.CHART] = chart_name
    template[c.CHART].text = chart_name.text.upper()
    template[c.CHART].value = chart_name.text.upper()
    if chart_name.text != '':
        remaining_results = [r for r in remaining_results if r.text != chart_name.text]
    
    # get grade
    grade = categorizer.guess_grade(remaining_results, template)
    template[c.GRADE] = grade
    template[c.GRADE].value = grade.text
    
    # get chart difficulty
    chart_diff = categorizer.guess_chart_diff(remaining_digits, template, debug)
    template[c.DIFFICULTY] = chart_diff
    if chart_diff.text != '':
        template[c.DIFFICULTY].value = int(chart_diff.text)
    
    # get single or double
    (found_type, type_idx) = categorizer.guess_chart_type(remaining_results, template, debug)
    template[c.TYPE] = found_type.copy()
    if found_type.text != '':
        template[c.TYPE].value = c.CHART_TYPES[type_idx]
        remaining_results = [r for r in remaining_results if r.text != found_type.text]
    
    # get username
    username = categorizer.guess_username(remaining_results, template, debug)
    template[c.USER] = username
    template[c.USER].value = username.text.upper()
    if username.text != '':
        remaining_results = [r for r in remaining_results if r.text != username.text]
    
    return (template, remaining_results)

def print_findings(template, remaining_results, debug=False):
    outputs = {
        c.USER.lower(): template[c.USER].value,
        c.CHART.lower(): template[c.CHART].value,
        c.TYPE.lower(): template[c.TYPE].value,
        c.DIFFICULTY.lower(): template[c.DIFFICULTY].value,
        c.GRADE.lower(): template[c.GRADE].value,
        c.PERFECT.lower(): template[c.PERFECT].value.text,
        c.GREAT.lower(): template[c.GREAT].value.text,
        c.GOOD.lower(): template[c.GOOD].value.text,
        c.BAD.lower(): template[c.BAD].value.text,
        c.MISS.lower(): template[c.MISS].value.text,
        c.MAX_COMBO.lower(): template[c.MAX_COMBO].value.text,
        c.TOTAL_SCORE.lower(): template[c.TOTAL_SCORE].value.text,
        "unclassified": [r.text for r in remaining_results]
    }
    
    if debug:
        print("======================")
        print(f'PLAYER: {template[c.USER].value}')
        print(f'CHART: {template[c.CHART].value} | {template[c.TYPE].value} {template[c.DIFFICULTY].value}')
        print(f'GRADE: {template[c.GRADE].value}')
    
        print("----------------------")
        for word in c.SCORE_WORDS:
            try:
                print(f'{word}: {template[word].value.text}')
            except:
                print(f'{word}: NOT FOUND')
        print("----------------------")
        print([r.text for r in remaining_results])
        print("======================")
    else:
        json_object = json.dumps(outputs, indent = 4).replace('null', '""')
        print(json_object)

def main(fname, local=False, debug=False):
    if local:
        # load the input image from 'input_images' directory
        dir = os.path.dirname(os.path.dirname(__file__))
        fname = os.path.join(dir, "input_images", args[0])
        image = PIL.Image.open(fname)
    else:
        # load the input image from URL
        image = PIL.Image.open(requests.get(fname, stream=True).raw)

    if image is None:
        print(f'unable to find {fname}')
        sys.stdout.flush()
        return

    # preprocess the image
    image = rotation.fix_rotation(image)
    image.thumbnail(params.MAX_IMG_SIZE, PIL.Image.Resampling.NEAREST)
    image = np.array(image)
    filtered = filter.filter_image(image, params.ALPHA, params.BETA)
    
    # OCR the input image using EasyOCR
    if debug:
        print("[DEBUG] OCR'ing input image...")
    reader = easyocr.Reader(['en'], gpu=True)
    results = reader.readtext(filtered)
    
    if len(results) == 0:
        print(f'OCR did not find any text {fname}')
        sys.stdout.flush()
        return

    # postprocess the text results
    (template, remaining_results) = post_process(results, debug=debug)
    
    # writes as JSON string and prints using basic print() statements
    print_findings(template, remaining_results, debug)
    
    sys.stdout.flush()

if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) == 1:
        main(args[0], local=False, debug=False)
    elif len(args) == 2:
        if args[1].upper() == "LOCAL":
            main(args[0], local=True, debug=False)
        elif args[1].upper() == "DEBUG":
            main(args[0], local=False, debug=True)
        else:
            print(f"{os.path.basename(__file__)}: Second arg must be 'LOCAL' or 'DEBUG' if included.")
    elif len(args) == 3:
        input_flags = [args[1].upper(), args[2].upper()]
        if "LOCAL" in input_flags and "DEBUG" in input_flags:
            main(args[0], local=True, debug=True)
        else:
            print(f"{os.path.basename(__file__)}: Additional args must be 'LOCAL' and 'DEBUG' if included.")
    elif len(args) > 3:
        print(f"{os.path.basename(__file__)}: Too many input args")
    else:
        print(f"{os.path.basename(__file__)}: Need to include filename")

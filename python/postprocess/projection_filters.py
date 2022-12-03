# pip install numpy==1.23.3

import numpy as np
import os

from resources.debugger import Debugger

def find_outliers(textboxes, axis, tol=0.75, reference=None, debug=False):
    """
    *********************************************************
    reference should be tuple
        representing (1D center, 1D stdev)
    *********************************************************
    returns indices
    *********************************************************
    """
    if debug:
        frame = f'{os.path.basename(__file__)}:{find_outliers.__name__}()'
        debugger = Debugger(frame)
        debugger.start_frame()
        debugger.write_comment("input textboxes (text field)")
        print(f'[DEBUG] \t- textboxes: {[t.text for t in textboxes]}')
        debugger.blank_line()

    # retrieve box means
    centers = [entry.center[axis] for entry in textboxes]
    
    # get statistics for preservation boundaries
    if reference is None:
        center = 0.5*np.mean(centers) + 0.5*np.median(centers)
        stdev = np.std(centers)
    else:
        center = reference[0]
        stdev = reference[1]
    
    upper = center + tol*stdev
    lower = center - tol*stdev
    
    if debug:
        debugger.write_comment("cutoff values")
        print(f'[DEBUG] \t- lower: {lower}')
        print(f'[DEBUG] \t- upper: {upper}')
        debugger.blank_line()
    
    # identify outlier indices
    outliers = list(map(lambda p: p < lower or p > upper, centers))
    outlier_idxs = [idx for idx, bool_val in enumerate(outliers) if bool_val]
    
    if debug:
        debugger.write_comment("outliers indices")
        print(f'[DEBUG] \t- outlier_idxs: {outlier_idxs}')
        debugger.end_frame()
    
    return outlier_idxs

def filter_outliers(textboxes, axis, tol=0.75, debug=False):
    """
    *********************************************************
    textboxes input is treated as a list of Textbox objects
    axis=0 for x-axis, axis=1 for y-axis
    *********************************************************
    returns with:
    - a filtered output of the input 'textboxes' list
    - the remaining entries of the input 'textboxes' list
    *********************************************************
    """
    outlier_idxs = find_outliers(textboxes, axis, tol, debug=debug)
    
    # create the filtered list
    filtered_list = []
    excluded_list = []
    for idx, entry in enumerate(textboxes):
        if idx in outlier_idxs:
            excluded_list.append(entry)
        else:
            filtered_list.append(entry)
    
    return (filtered_list, excluded_list)

def find_displacement_outliers(digits, axis, tol=1.5, debug=False):
    """
    *********************************************************
    digits input is treated as a list of Textbox objects
    axis=0 for x-axis, axis=1 for y-axis
    *********************************************************
    returns with a filtered output of the input 'digits' list
    *********************************************************
    """
    if debug:
        frame = f'{os.path.basename(__file__)}:{find_displacement_outliers.__name__}()'
        debugger = Debugger(frame)
        debugger.start_frame()
        debugger.write_comment("input digits (text field)")
        print(f'[DEBUG] \t- digits: {[num.text for num in digits]}')
        debugger.blank_line()

    # retrieve box mean displacements
    centers = [entry.center[axis] for entry in digits]

    if debug:
        debugger.write_comment("box centers of input digits")
        print(f'[DEBUG] \t- centers: {centers}')
        debugger.blank_line()

    centers = np.diff(centers)
    center = 0.5*np.mean(centers) + 0.5*np.median(centers)

    if debug:
        debugger.write_comment("displacements between input digits")
        print(f'[DEBUG] \t- centers: {centers}')
        print(f'[DEBUG] \t- center: {center}')
        print(f'[DEBUG] \t- tol: {tol}')

    # identify outlier indices
    outliers = list(map(lambda p: p > tol*center, centers))
    outlier_idxs = [idx for idx, bool_val in enumerate(outliers) if bool_val]

    # using displacements shifts indices by one; shift it back before returning
    outlier_idxs = [x + 1 for x in outlier_idxs]

    if debug:
        debugger.end_frame()

    return outlier_idxs

def filter_displacement_outliers(digits, axis, tol=2, debug=False):
    """
    *********************************************************
    digits input is treated as a list of Textbox objects
    axis=0 for x-axis, axis=1 for y-axis
    *********************************************************
    returns with:
    - a filtered output of the input 'digits' list
    - the remaining entries of the input 'digits' list
    - whether or not any outliers were found
    *********************************************************
    """
    if debug:
        frame = f'{os.path.basename(__file__)}:{filter_displacement_outliers.__name__}()'
        debugger = Debugger(frame)
        debugger.start_frame()

    outlier_idxs = find_displacement_outliers(digits, axis, tol, debug)

    # create the filtered list
    filtered_list = []
    excluded_list = []
    for idx, entry in enumerate(digits):
        if idx in outlier_idxs:
            excluded_list.append(entry)
        else:
            filtered_list.append(entry)

    if debug:
        debugger.end_frame()

    return (filtered_list, excluded_list)
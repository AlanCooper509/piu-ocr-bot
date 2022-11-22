import numpy as np
import os

from resources.debugger import Debugger

def find_outliers(textboxes, axis, tol=0.75, reference=None):
    """
    *********************************************************
    reference should be tuple
        representing (1D center, 1D stdev)
    *********************************************************
    returns indices
    *********************************************************
    """
    
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
    
    # identify outlier indices
    outliers = list(map(lambda p: p < lower or p > upper, centers))
    outlier_idxs = [idx for idx, bool_val in enumerate(outliers) if bool_val]
    
    return outlier_idxs

def filter_outliers(textboxes, axis, tol=0.75):
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
    
    outlier_idxs = find_outliers(textboxes, axis, tol)
    
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
    frame = f'{os.path.basename(__file__)}:{find_displacement_outliers.__name__}()'

    if debug:
        Debugger.start_frame(frame)

    # retrieve box mean displacements
    centers = [entry.center[axis] for entry in digits]
    centers = np.diff(centers)
    center = 0.5*np.mean(centers) + 0.5*np.median(centers)

    # identify outlier indices
    outliers = list(map(lambda p: p > tol*center, centers))
    outlier_idxs = [idx for idx, bool_val in enumerate(outliers) if bool_val]

    # using displacements shifts indices by one; shift it back before returning
    outlier_idxs = [x + 1 for x in outlier_idxs]

    if debug:
        Debugger.end_frame(frame)

    return outlier_idxs

def filter_displacement_outliers(digits, axis, tol=3, debug=False):
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
    frame = f'{os.path.basename(__file__)}:{filter_displacement_outliers.__name__}()'

    if debug:
        Debugger.start_frame(frame)

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
        Debugger.end_frame(frame)

    return (filtered_list, excluded_list)
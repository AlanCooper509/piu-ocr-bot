import numpy as np

def filter_outliers(digits, axis, tol=0.75):
    """
    *********************************************************
    digits input is treated as a list of Textbox objects
    axis=0 for x-axis, axis=1 for y-axis
    *********************************************************
    returns with:
    - a filtered output of the input 'digits' list
    - the remaining entries of the input 'digits' list
    *********************************************************
    """

    # retrieve box means
    centers = [entry.center[axis] for entry in digits]
    
    # get statistics for preservation boundaries
    center = 0.5*np.mean(centers) + 0.5*np.median(centers)
    stdev = np.std(centers)
    upper = center + tol*stdev
    lower = center - tol*stdev

    # identify outlier indices
    outliers = list(map(lambda p: p < lower or p > upper, centers))
    outlier_idxs = [idx for idx, bool_val in enumerate(outliers) if bool_val]

    # create the filtered list
    filtered_list = []
    excluded_list = []
    for idx, entry in enumerate(digits):
        if idx in outlier_idxs:
            excluded_list.append(entry)
        else:
            filtered_list.append(entry)
    
    return (filtered_list, excluded_list)

def find_displacement_outliers(digits, axis, tol=1.5):
    """
    *********************************************************
    digits input is treated as a list of Textbox objects
    axis=0 for x-axis, axis=1 for y-axis
    *********************************************************
    returns with a filtered output of the input 'digits' list
    *********************************************************
    """

    # retrieve box mean displacements
    centers = [entry.center[axis] for entry in digits]
    centers = np.diff(centers)
    center = 0.5*np.mean(centers) + 0.5*np.median(centers)

    # identify outlier indices
    outliers = list(map(lambda p: p > tol*center, centers))
    outlier_idxs = [idx for idx, bool_val in enumerate(outliers) if bool_val]

    # using displacements shifts indices by one; shift it back before returning
    outlier_idxs = [x + 1 for x in outlier_idxs]
    return outlier_idxs

def filter_displacement_outliers(digits, axis, tol=3):
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

    outlier_idxs = find_displacement_outliers(digits, axis, tol)

    # create the filtered list
    filtered_list = []
    excluded_list = []
    for idx, entry in enumerate(digits):
        if idx in outlier_idxs:
            excluded_list.append(entry)
        else:
            filtered_list.append(entry)
    
    return (filtered_list, excluded_list)
def filter_image(image, alpha, beta):
    """
    pixel' = alpha*pixel + beta
        alpha = contrast filter value
        beta = brightness filter value
    """
    # green channel looks good for contrasting text with background
    green_channel = image[:,:,1]
    filter = alpha*green_channel - beta
    filter[filter>255] = 255
    filter[filter<0] = 0
    filter = filter.astype("uint8")
    return filter
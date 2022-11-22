from resources.constants import DEBUG_PREFIX

class Debugger:
    def start_frame(frame):
        message = f'{DEBUG_PREFIX} Start: {frame}'

        double_border = "=" * len(message)
        single_border = "-" * len(message)

        print(double_border)
        print(message)
        print(single_border)
    
    def end_frame(frame):
        message = f'{DEBUG_PREFIX} End: {frame}'

        # +2 in order to match with start of the frame
        single_border = "-" * (len(message) + 2)
        double_border = "=" * (len(message) + 2)

        print(single_border)
        print(message)
        print(double_border)

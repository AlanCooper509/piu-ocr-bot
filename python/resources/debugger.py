from resources.constants import DEBUG_PREFIX

class Debugger:
    frame = ''
    
    def __init__(self, frame):
        self.frame = frame
    
    def start_frame(self):
        message = f'{DEBUG_PREFIX} Start: {self.frame}'

        double_border = "=" * len(message)
        single_border = "-" * len(message)

        print(double_border)
        print(message)
        print(single_border)
    
    def end_frame(self):
        message = f'{DEBUG_PREFIX} End: {self.frame}'

        # +2 in order to match with start of the frame
        single_border = "-" * (len(message) + 2)
        double_border = "=" * (len(message) + 2)

        print(single_border)
        print(message)
        print(double_border)
    
    def write_comment(self, comment):
        print(f'{DEBUG_PREFIX} {self.frame}')
        print(f'{DEBUG_PREFIX} - {comment}')
    
    def blank_line(self):
        print(f'{DEBUG_PREFIX}')

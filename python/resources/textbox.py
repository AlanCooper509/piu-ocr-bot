import numpy as np

class Textbox:
    box = [[-1, -1], [-1, -1], [-1, -1], [-1, -1]]
    center = [-1, -1]
    text = ''
    confidence = 0
    area = 0
    value = None

    def __init__(self, entry=None):
        if entry == None:
            return
        self.box = entry[0]
        self.text = entry[1]
        self.confidence = entry[2]
        self.area = self.shoelace_area(entry[0])
        self.center = self.box_center(entry[0])

    def shoelace_area(self, box):
        p1 = box[0][0]*box[1][1] + box[1][0]*box[2][1] + box[2][0]*box[3][1] + box[3][0]*box[0][1]
        p2 = box[1][0]*box[0][1] + box[2][0]*box[1][1] + box[3][0]*box[2][1] + box[0][0]*box[3][1]
        area = abs(0.5 * (p1 - p2))
        return area

    def box_center(self, box):
        xmean = np.mean([box[0][0], box[1][0], box[2][0], box[3][0]])
        ymean = np.mean([box[0][1], box[1][1], box[2][1], box[3][1]])
        return [xmean, ymean]
    
    def copy(self):
        return Textbox((self.box, self.text, self.confidence))
##########################################
#
# Methods and data in this file is only used if USE_WEBHOOKS = True in server.y
#
##########################################

from flask import Response

dialingStatus = dict({
    "gate_name": "Stargate", 
    "local_address": [], 
    "address_buffer_outgoing": [], 
    "locked_chevrons_outgoing": 0, 
    "address_buffer_incoming": [], 
    "locked_chevrons_incoming": 0, 
    "wormhole_active": False, 
    "black_hole_connected": False, 
    "connected_planet": None, 
    "wormhole_open_time": None, 
    "wormhole_max_time": 2280.0, 
    "wormhole_time_till_close": 0, 
    "ring_position": 813, 
    "speed_dial_full_address": True
})

symbols = [
    {"index": 1, "name": "Earth", "keyboard_mapping": "8", "imageSrc": "/chevrons/milkyway/001.svg"}, 
    {"index": 2, "name": "Crater", "keyboard_mapping": "C", "imageSrc": "/chevrons/milkyway/002.svg"}, 
    {"index": 3, "name": "Virgo", "keyboard_mapping": "V", "imageSrc": "/chevrons/milkyway/003.svg"}, 
    {"index": 4, "name": "Bootes", "keyboard_mapping": "U", "imageSrc": "/chevrons/milkyway/004.svg"}, 
    {"index": 5, "name": "Centaurus", "keyboard_mapping": "a", "imageSrc": "/chevrons/milkyway/005.svg"}, 
    {"index": 6, "name": "Libra", "keyboard_mapping": "3", "imageSrc": "/chevrons/milkyway/006.svg"}, 
    {"index": 7, "name": "Serpens Caput", "keyboard_mapping": "5", "imageSrc": "/chevrons/milkyway/007.svg"}, 
    {"index": 8, "name": "Norma", "keyboard_mapping": "S", "imageSrc": "/chevrons/milkyway/008.svg"}, 
    {"index": 9, "name": "Scorpio", "keyboard_mapping": "b", "imageSrc": "/chevrons/milkyway/009.svg"}, 
    {"index": 10, "name": "Cra", "keyboard_mapping": "K", "imageSrc": "/chevrons/milkyway/010.svg"}, 
    {"index": 11, "name": "Scutum", "keyboard_mapping": "X", "imageSrc": "/chevrons/milkyway/011.svg"}, 
    {"index": 12, "name": "Sagittarius", "keyboard_mapping": "Z", "imageSrc": "/chevrons/milkyway/012.svg"}, 
    {"index": 13, "name": "Aquila", "is_on_dhd": False, "keyboard_mapping": False, "imageSrc": "/chevrons/milkyway/013.svg"}, 
    {"index": 14, "name": "Mic", "keyboard_mapping": "E", "imageSrc": "/chevrons/milkyway/014.svg"}, 
    {"index": 15, "name": "Capricorn", "keyboard_mapping": "P", "imageSrc": "/chevrons/milkyway/015.svg"}, 
    {"index": 16, "name": "Pisces Austrinus", "keyboard_mapping": "M", "imageSrc": "/chevrons/milkyway/016.svg"}, 
    {"index": 17, "name": "Equuleus", "keyboard_mapping": "D", "imageSrc": "/chevrons/milkyway/017.svg"}, 
    {"index": 18, "name": "Aquarius", "keyboard_mapping": "F", "imageSrc": "/chevrons/milkyway/018.svg"}, 
    {"index": 19, "name": "Pegasus", "keyboard_mapping": "7", "imageSrc": "/chevrons/milkyway/019.svg"}, 
    {"index": 20, "name": "Sculptor", "keyboard_mapping": "c", "imageSrc": "/chevrons/milkyway/020.svg"}, 
    {"index": 21, "name": "Pisces", "keyboard_mapping": "W", "imageSrc": "/chevrons/milkyway/021.svg"}, 
    {"index": 22, "name": "Andromeda", "keyboard_mapping": "6", "imageSrc": "/chevrons/milkyway/022.svg"}, 
    {"index": 23, "name": "Triangulum", "keyboard_mapping": "G", "imageSrc": "/chevrons/milkyway/023.svg"}, 
    {"index": 24, "name": "Aries", "keyboard_mapping": "4", "imageSrc": "/chevrons/milkyway/024.svg"}, 
    {"index": 25, "name": "Perseus", "keyboard_mapping": "B", "imageSrc": "/chevrons/milkyway/025.svg"}, 
    {"index": 26, "name": "Cetus", "keyboard_mapping": "H", "imageSrc": "/chevrons/milkyway/026.svg"}, 
    {"index": 27, "name": "Taurus", "keyboard_mapping": "R", "imageSrc": "/chevrons/milkyway/027.svg"}, 
    {"index": 28, "name": "Auriga", "keyboard_mapping": "L", "imageSrc": "/chevrons/milkyway/028.svg"}, 
    {"index": 29, "name": "Eridanus", "keyboard_mapping": "2", "imageSrc": "/chevrons/milkyway/029.svg"}, 
    {"index": 30, "name": "Orion", "keyboard_mapping": "N", "imageSrc": "/chevrons/milkyway/030.svg"}, 
    {"index": 31, "name": "Canis Minor", "keyboard_mapping": "Q", "imageSrc": "/chevrons/milkyway/031.svg"}, 
    {"index": 32, "name": "Monoceros", "keyboard_mapping": "9", "imageSrc": "/chevrons/milkyway/032.svg"}, 
    {"index": 33, "name": "Gemini", "keyboard_mapping": "J", "imageSrc": "/chevrons/milkyway/033.svg"}, 
    {"index": 34, "name": "Hydra", "keyboard_mapping": "0", "imageSrc": "/chevrons/milkyway/034.svg"}, 
    {"index": 35, "name": "Lynx", "keyboard_mapping": "O", "imageSrc": "/chevrons/milkyway/035.svg"}, 
    {"index": 36, "name": "Cancer", "keyboard_mapping": "T", "imageSrc": "/chevrons/milkyway/036.svg"}, 
    {"index": 37, "name": "Sextans", "keyboard_mapping": "Y", "imageSrc": "/chevrons/milkyway/037.svg"}, 
    {"index": 38, "name": "Leo Minor", "keyboard_mapping": "1", "imageSrc": "/chevrons/milkyway/038.svg"}, 
    {"index": 39, "name": "Leo", "keyboard_mapping": "I", "imageSrc": "/chevrons/milkyway/039.svg"}
]

address_book = { 
    "PJ2-445": {
      "name": "PJ2-445",
      "gate_address": [
        11,
        9,
        18,
        19,
        20,
        25
      ],
      "is_black_hole": False,
      "type": "standard"
    }
}

# Methods that the UI will call
def get_data(path):
    if path == 'get/dialing_status':
        return dialingStatus
    elif path == 'get/symbols_all':
        return symbols
    elif path == 'get/address_book':
        return {
           "address_book": address_book,
           "summary": {
               "fan": len([addr for addr in address_book.values() if addr['type'] == 'fan']),
               "standard": len([addr for addr in address_book.values() if addr['type'] == 'standard'])
           },
           "galaxy_path": "milkyway"
        }
    else:
        return Response(None, status=404)
    
def set_data(path, json):
    if path == 'set/dialing_status':
        # Can send in partial dialing status
        dialingStatus.update(json)
        return dialingStatus
    elif path == 'set/symbols':
        symbols = json
        return symbols
    elif path == 'set/address':
        # Must send in full address object, cannot update just the name or just the gate_address
        address_book.update(json)
        return address_book
    elif path == 'action/close_wormhole':
        dialingStatus.update({ 
          "address_buffer_outgoing": [], 
          "locked_chevrons_outgoing": 0, 
          "address_buffer_incoming": [], 
          "locked_chevrons_incoming": 0, 
          "wormhole_active": False, 
          "black_hole_connected": False, 
          "connected_planet": None, 
          "wormhole_open_time": None, 
          "wormhole_max_time": 2280.0, 
          "wormhole_time_till_close": 0, 
        })
    ##############################################################
    # Add below any other methods you'd like your webhook to call
    ##############################################################
    else:
        return Response(None, status=404)
    
def pre_post_hook(path, json): # Is that an oxymoron??
    if path == 'do/dhd_press':
        dialingStatus['address_buffer_outgoing'].append(json['symbol'])
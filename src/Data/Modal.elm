module Data.Modal exposing (ModalModel, modalInit)


type alias ModalModel =
    { isOpen : Bool
    , inPocket : List String
    }


modalInit : ModalModel
modalInit =
    { isOpen = False
    , inPocket = []
    }

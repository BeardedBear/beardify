module Data.Modal exposing (Model, init)


init : Model
init =
    { isOpen = False
    , inPocket = []
    }


type alias Model =
    { isOpen : Bool
    , inPocket : List String
    }

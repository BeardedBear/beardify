module Data.Image exposing (Image, decode, filterByWidth)

import Json.Decode as Decode exposing (Decoder)


type alias Image =
    { height : Int
    , url : String
    , width : Int
    }


default : Image
default =
    { height = 0
    , url = ""
    , width = 0
    }


decode : Decoder Image
decode =
    Decode.map3 Image
        (Decode.field "height"
            (Decode.map
                (Maybe.withDefault 0)
                (Decode.maybe Decode.int)
            )
        )
        (Decode.field "url" Decode.string)
        (Decode.field "width"
            (Decode.map
                (Maybe.withDefault 0)
                (Decode.maybe Decode.int)
            )
        )


filterByWidth : Int -> List Image -> Image
filterByWidth width =
    List.filter (\i -> i.width == width)
        >> List.head
        >> Maybe.withDefault default

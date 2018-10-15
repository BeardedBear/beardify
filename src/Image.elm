module Image exposing (Image, ImageSize(..), decodeImage, imageView)

import Html exposing (..)
import Html.Attributes exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode


type alias Image =
    { url : String
    }


decodeImage : Decode.Decoder Image
decodeImage =
    Decode.map Image
        (Decode.field "url" Decode.string)


type ImageSize
    = Small
    | Medium
    | Large


imageView : ImageSize -> List Image -> Html msg
imageView size image =
    case size of
        Small ->
            image
                |> List.reverse
                |> List.head
                |> Maybe.withDefault { url = "" }
                |> (\c -> img [ src c.url ] [])

        Medium ->
            text ""

        Large ->
            image
                |> List.head
                |> Maybe.withDefault { url = "" }
                |> (\c -> img [ src c.url ] [])

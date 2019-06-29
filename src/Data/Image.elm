module Data.Image exposing (Image, ImageSize(..), decodeImage, imageView)

import Html as Html exposing (..)
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
    let
        showImage c =
            if c.url == "" then
                text ""

            else
                img [ src c.url ] []
    in
    case size of
        Small ->
            image
                |> List.reverse
                |> List.head
                |> Maybe.withDefault { url = "" }
                |> showImage

        Medium ->
            image
                |> List.take 2
                |> List.reverse
                |> List.head
                |> Maybe.withDefault { url = "" }
                |> showImage

        Large ->
            image
                |> List.head
                |> Maybe.withDefault { url = "" }
                |> showImage

module Data.Image exposing (Image, ImageSize(..), decodeImage, imageView)

import Html exposing (Html, img, text)
import Html.Attributes exposing (src)
import Json.Decode as Decode exposing (field)


type alias Image =
    String


decodeImage : Decode.Decoder Image
decodeImage =
    Decode.field "url" Decode.string


type ImageSize
    = Small
    | Medium
    | Large


imageView : ImageSize -> List Image -> Html msg
imageView size image =
    let
        showImage c =
            if c == "" then
                text ""

            else
                img [ src c ] []
    in
    case size of
        Small ->
            image
                |> List.reverse
                |> List.head
                |> Maybe.withDefault ""
                |> showImage

        Medium ->
            image
                |> List.take 2
                |> List.reverse
                |> List.head
                |> Maybe.withDefault ""
                |> showImage

        Large ->
            image
                |> List.head
                |> Maybe.withDefault ""
                |> showImage

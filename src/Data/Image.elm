module Data.Image exposing (Image, ImageSize(..), decodeImage, imageView)

import Html exposing (Html, img, text)
import Html.Attributes exposing (class, src)
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


imageView : ImageSize -> String -> List Image -> Html msg
imageView size className image =
    let
        showImage c =
            if c == "" then
                text ""

            else
                img [ src c, class className ] []
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

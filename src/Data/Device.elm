module Data.Device exposing (Device, decode)

import Json.Decode as Decode exposing (Decoder)


type alias Device =
    { active : Bool
    , restricted : Bool
    , privateSession : Bool
    , id : Id
    , name : String
    , type_ : Type
    , volume : Int
    }


type Type
    = Computer
    | Tablet
    | Smartphone
    | Speaker
    | TV
    | AVR
    | STB
    | AudioDongle
    | GameConsole
    | CastVideo
    | CastAudio
    | Automobile
    | Unknown


type Id
    = Id String


decode : Decoder Device
decode =
    Decode.map7 Device
        (Decode.field "active" Decode.bool)
        (Decode.field "restricted" Decode.bool)
        (Decode.field "privateSession" Decode.bool)
        (Decode.field "id" (Decode.map Id Decode.string))
        (Decode.field "name" Decode.string)
        (Decode.field "type" decodeType)
        (Decode.field "volume" Decode.int)


decodeType : Decoder Type
decodeType =
    Decode.string
        |> Decode.andThen
            (\string ->
                case string of
                    "Computer" ->
                        Decode.succeed Computer

                    "Tablet" ->
                        Decode.succeed Tablet

                    "Smartphone" ->
                        Decode.succeed Smartphone

                    "Speaker" ->
                        Decode.succeed Speaker

                    "TV" ->
                        Decode.succeed TV

                    "AVR" ->
                        Decode.succeed AVR

                    "STB" ->
                        Decode.succeed STB

                    "AudioDongle" ->
                        Decode.succeed AudioDongle

                    "GameConsole" ->
                        Decode.succeed GameConsole

                    "CastVideo" ->
                        Decode.succeed CastVideo

                    "CastAudio" ->
                        Decode.succeed CastAudio

                    "Automobile" ->
                        Decode.succeed Automobile

                    _ ->
                        Decode.succeed Unknown
            )

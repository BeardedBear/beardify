module Data.Device exposing (Device, decode, typeToString)

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
        (Decode.field "is_active" Decode.bool)
        (Decode.field "is_restricted" Decode.bool)
        (Decode.field "is_private_session" Decode.bool)
        (Decode.field "id" (Decode.map Id Decode.string))
        (Decode.field "name" Decode.string)
        (Decode.field "type" decodeType)
        (Decode.field "volume_percent" Decode.int)


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


typeToString : Type -> String
typeToString type_ =
    case type_ of
        Computer ->
            "computer"

        Tablet ->
            "tablet"

        Smartphone ->
            "smartphone"

        Speaker ->
            "speaker"

        TV ->
            "tv"

        AVR ->
            "avr"

        STB ->
            "stb"

        AudioDongle ->
            "audiodongle"

        GameConsole ->
            "gameconsole"

        CastVideo ->
            "castvideo"

        CastAudio ->
            "castaudio"

        Automobile ->
            "automobile"

        Unknown ->
            "unknown"

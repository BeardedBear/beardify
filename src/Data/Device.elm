module Data.Device exposing
    ( Device
    , Id
    , decode
    , deviceInit
    , idToString
    , isComputer
    )

import Json.Decode as Decode exposing (Decoder)


type DeviceType
    = Computer
    | Tablet
    | Smartphone
    | Speaker
    | Tv
    | Avr
    | STB
    | AudioDongle
    | GameConsole
    | CastVideo
    | Automobile
    | Unknown


type Id
    = Id String


type alias Device =
    { id : Id
    , name : String
    , volumePercent : Int
    , isActive : Bool
    , isRestricted : Bool
    , type_ : DeviceType
    }


idToString : Id -> String
idToString (Id id) =
    id


isComputer : Device -> Bool
isComputer device =
    case device.type_ of
        Computer ->
            True

        _ ->
            False


deviceInit : Device
deviceInit =
    { id = Id ""
    , name = ""
    , volumePercent = 0
    , isActive = False
    , isRestricted = False
    , type_ = Unknown
    }


decodeDeviceType : Decoder DeviceType
decodeDeviceType =
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
                        Decode.succeed Tv

                    "AVR" ->
                        Decode.succeed Avr

                    "STB" ->
                        Decode.succeed STB

                    "AudioDongle" ->
                        Decode.succeed AudioDongle

                    "GameConsole" ->
                        Decode.succeed GameConsole

                    "CastVideo" ->
                        Decode.succeed CastVideo

                    "Automobile" ->
                        Decode.succeed Automobile

                    "Unknown" ->
                        Decode.succeed Unknown

                    _ ->
                        Decode.fail "Invalid DeviceType"
            )


decodeId : Decoder Id
decodeId =
    Decode.andThen (Decode.succeed << Id) Decode.string


decode : Decoder Device
decode =
    Decode.map6 Device
        (Decode.field "id" decodeId)
        (Decode.field "name" Decode.string)
        (Decode.field "volume_percent" Decode.int)
        (Decode.field "is_active" Decode.bool)
        (Decode.field "is_restricted" Decode.bool)
        (Decode.field "type" decodeDeviceType)

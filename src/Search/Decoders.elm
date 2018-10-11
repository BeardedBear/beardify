module Search.Decoders exposing (decodeAlbum, decodeAlbumCover, decodeArtist, decodeListAlbum, decodeListArtist, decodeListTrack, decodeTrack)

import Json.Decode as Decode exposing (..)
import Types exposing (..)



-- Albums


decodeAlbum : Decode.Decoder Album
decodeAlbum =
    Decode.map7 Album
        (Decode.field "album_type" Decode.string)
        (Decode.at [ "artists" ] (Decode.list decodeArtist))
        (Decode.at [ "images" ] (Decode.list decodeAlbumCover))
        (Decode.field "name" Decode.string)
        (Decode.field "release_date" Decode.string)
        (Decode.field "type" Decode.string)
        (Decode.field "uri" Decode.string)


decodeAlbumCover : Decode.Decoder Cover
decodeAlbumCover =
    Decode.map Cover
        (Decode.field "url" Decode.string)


decodeListAlbum : Decode.Decoder ListAlbum
decodeListAlbum =
    Decode.map ListAlbum
        (Decode.at [ "albums", "items" ] (Decode.list decodeAlbum))



-- Artists


decodeArtist : Decode.Decoder Artist
decodeArtist =
    Decode.map2 Artist
        (Decode.field "name" Decode.string)
        (Decode.field "type" Decode.string)


decodeListArtist : Decode.Decoder ListArtist
decodeListArtist =
    Decode.map ListArtist
        (Decode.at [ "artists", "items" ] (Decode.list decodeArtist))



-- Tracks


decodeTrack : Decode.Decoder Track
decodeTrack =
    Decode.map5 Track
        (Decode.field "name" Decode.string)
        (Decode.field "duration_ms" Decode.int)
        (Decode.at [ "artists" ] (Decode.list decodeArtist))
        (Decode.at [ "album" ] decodeAlbum)
        (Decode.field "uri" Decode.string)


decodeListTrack : Decode.Decoder ListTrack
decodeListTrack =
    Decode.map ListTrack
        (Decode.at [ "tracks", "items" ] (Decode.list decodeTrack))

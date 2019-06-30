module Page.Artist exposing (Msg(..), init, update, view)

import Data.Album exposing (Album, decodeAlbum)
import Data.Artist exposing (Artist, artistInit, decodeArtist)
import Data.Image
import Data.Meta exposing (ArtistModel)
import Data.Session exposing (Session)
import Data.Track exposing (Track, decodeTrack)
import Data.Youtube exposing (Youtube, getVideos)
import Html exposing (Html, a, div, i, iframe, text)
import Html.Attributes exposing (attribute, class, classList, height, href, src, target, width)
import Html.Events exposing (onClick)
import Http
import Json.Decode as Decode exposing (map)
import List.Extra as LE
import Request
import Route
import Utils


init : String -> Session -> ( ArtistModel, Cmd Msg )
init id session =
    ( { artist = artistInit
      , albums = []
      , videos = []
      , topTracks = []
      , relatedArtists = []
      }
    , Cmd.batch
        [ Http.send SetArtist <| Request.get "artists/" id "" decodeArtist session.token
        , Http.send SetArtistAlbums <| Request.get "artists/" id "/albums?market=FR&album_type=album" (Decode.at [ "items" ] (Decode.list decodeAlbum)) session.token
        , Http.send SetArtistTopTracks <| Request.get "artists/" id "/top-tracks?country=FR" (Decode.at [ "tracks" ] (Decode.list decodeTrack)) session.token
        , Http.send SetRelatedArtists <| Request.get "artists/" id "/related-artists" (Decode.at [ "artists" ] (Decode.list decodeArtist)) session.token
        ]
    )


type Msg
    = SetArtist (Result Http.Error Artist)
    | SetArtistAlbums (Result Http.Error (List Album))
    | SetArtistTopTracks (Result Http.Error (List Track))
    | SetRelatedArtists (Result Http.Error (List Artist))
    | SetYoutube (Result Http.Error Youtube)
    | PlayTracks (List String)
    | PlayAlbum String


update : Msg -> ArtistModel -> ( ArtistModel, Cmd Msg )
update msg model =
    case msg of
        SetArtist (Ok e) ->
            ( { model | artist = e }
            , Cmd.batch
                [ Http.send SetYoutube <| getVideos e.name
                ]
            )

        SetArtist (Err _) ->
            ( model, Cmd.none )

        SetArtistAlbums (Ok e) ->
            ( { model | albums = e }
            , Cmd.none
            )

        SetArtistAlbums (Err _) ->
            ( model, Cmd.none )

        SetArtistTopTracks (Ok e) ->
            ( { model | topTracks = e }, Cmd.none )

        SetArtistTopTracks (Err _) ->
            ( model, Cmd.none )

        SetRelatedArtists (Ok e) ->
            ( { model | relatedArtists = e }, Cmd.none )

        SetRelatedArtists (Err _) ->
            ( model, Cmd.none )

        SetYoutube (Ok e) ->
            ( { model | videos = e }, Cmd.none )

        SetYoutube (Err _) ->
            ( model, Cmd.none )

        PlayTracks _ ->
            ( model, Cmd.none )

        PlayAlbum _ ->
            ( model, Cmd.none )


view : Session -> ArtistModel -> ( String, List (Html Msg) )
view session model =
    let
        listTracksUri id =
            model.topTracks
                |> LE.dropWhile (\e -> e.uri /= id)
                |> List.map .uri

        trackItem t =
            div
                [ classList
                    [ ( "track", True )
                    , ( "active", t.uri == session.player.item.uri )
                    ]
                ]
                [ div [] [ Data.Image.imageView Data.Image.Small t.album.images ]
                , div [ onClick <| PlayTracks (listTracksUri t.uri) ] [ text t.name ]
                , div [] [ text (Utils.durationFormat t.duration_ms) ]
                ]

        relatedArtistItem r =
            a [ class "related-artist", Route.href (Route.Artist r.id) ]
                [ div [] [ Data.Image.imageView Data.Image.Small r.images ]
                , div [] [ text r.name ]
                ]

        videoFrame v =
            div [ class "video-frame" ]
                [ iframe [ class "video", attribute "allowfullscreen" "", attribute "frameborder" "0", width 250, height 140, src <| "https://www.youtube.com/embed/" ++ v.id ] []
                , div [ class "video-title" ] [ text v.snippet.title ]
                , div [ class "artist-name" ] [ a [ target "_BLANK", href ("https://www.youtube.com/channel/" ++ v.snippet.channelId) ] [ text v.snippet.channelTitle ] ]
                ]

        albumItem ar =
            div
                [ classList
                    [ ( "album", True )
                    , ( "active", session.player.item.album.id == ar.id )
                    ]
                ]
                [ a
                    [ class "img"
                    , Route.href (Route.Album ar.id)
                    ]
                    [ Data.Image.imageView Data.Image.Medium ar.images
                    ]
                , div [] [ text ar.name ]
                , div [ class "date" ] [ text <| "(" ++ Utils.releaseDateFormat ar.release_date ++ ")" ]
                , div [ class "playing-btn", onClick <| PlayAlbum ar.uri ] [ i [ class "icon-play" ] [] ]
                , div [ class "add-btn" ] [ i [ class "icon-add" ] [] ]
                ]

        link name urlBefore urlAfter icon =
            a [ href <| urlBefore ++ model.artist.name ++ urlAfter, target "_BLANK" ] [ i [ class <| "icon-" ++ icon ] [], text name ]
    in
    ( model.artist.name
    , [ div [ class "artist-wrapper" ]
            [ div []
                [ div [ class "heading-page" ] [ text model.artist.name ]
                , div [ class "links" ]
                    [ link "Wikipedia" "https://fr.wikipedia.org/wiki/" "" "wikipedia"
                    , link "Sputnik" "https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=" "&x=0&y=0" "sputnik"
                    , link "Discogs" "https://www.discogs.com/fr/search/?q=" "&type=artist&strict=true" "discogs"
                    , link "Google" "https://www.google.com/search?q=" "" "magnifying-glass"
                    ]
                , div [ class "artist-head" ]
                    [ div [ class "top-tracks" ]
                        [ div [ class "sub-title" ] [ text "Top tracks" ]
                        , div [] (model.topTracks |> List.take 5 |> List.map trackItem)
                        ]
                    , div []
                        [ div [ class "sub-title" ] [ text "Similar artists" ]
                        , div [ class "related-artists" ] (model.relatedArtists |> List.take 4 |> List.map relatedArtistItem)
                        ]
                    ]
                , div [ class "sub-title" ] [ text "Albums" ]
                , model.albums
                    |> List.map albumItem
                    |> div [ class "album-list-wrapper" ]
                ]
            , div [ class "video-wrapper" ]
                [ div [ class "sub-title" ] [ text "Videos" ]
                , div [] (model.videos |> List.map videoFrame)
                ]
            ]
      ]
    )

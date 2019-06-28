module Page.Artist exposing (Msg(..), init, update, view)

import Data.Album
import Data.Artist
import Data.Image
import Data.Meta
import Data.Session
import Data.Track
import Data.Youtube
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Http
import Json.Decode as Decode exposing (..)
import List.Extra as LE
import Request
import Route
import Utils
import Views.Artist


init : String -> Data.Session.Session -> ( Data.Meta.ArtistModel, Cmd Msg )
init id session =
    ( { artist = Data.Artist.init
      , albums = []
      , videos = []
      , topTracks = []
      , relatedArtists = []
      }
    , Cmd.batch
        [ Http.send SetArtist <| Request.get "artists/" id "" Data.Artist.decodeArtist session.token
        , Http.send SetArtistAlbums <| Request.get "artists/" id "/albums?market=FR&album_type=album" (Decode.at [ "items" ] (Decode.list Data.Album.decodeAlbum)) session.token
        , Http.send SetArtistTopTracks <| Request.get "artists/" id "/top-tracks?country=FR" (Decode.at [ "tracks" ] (Decode.list Data.Track.decodeTrack)) session.token
        , Http.send SetRelatedArtists <| Request.get "artists/" id "/related-artists" (Decode.at [ "artists" ] (Decode.list Data.Artist.decodeArtist)) session.token
        ]
    )


type Msg
    = SetArtist (Result Http.Error Data.Artist.Artist)
    | SetArtistAlbums (Result Http.Error (List Data.Album.Album))
    | SetArtistTopTracks (Result Http.Error (List Data.Track.Track))
    | SetRelatedArtists (Result Http.Error (List Data.Artist.Artist))
    | SetYoutube (Result Http.Error Data.Youtube.Youtube)
    | PlayTracks (List String)
    | PlayAlbum String


update : Data.Session.Session -> Msg -> Data.Meta.ArtistModel -> ( Data.Meta.ArtistModel, Cmd Msg )
update session msg model =
    case msg of
        SetArtist (Ok e) ->
            ( { model | artist = e }
            , Cmd.batch
                [ Http.send SetYoutube <| Data.Youtube.getVideos e.name
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
            ( { model | videos = e.items }, Cmd.none )

        SetYoutube (Err _) ->
            ( model, Cmd.none )

        PlayTracks _ ->
            ( model, Cmd.none )

        PlayAlbum _ ->
            ( model, Cmd.none )


view : Data.Session.Session -> Data.Meta.ArtistModel -> ( String, List (Html Msg) )
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
                [ iframe [ class "video", attribute "allowfullscreen" "", attribute "frameborder" "0", width 250, height 140, src <| "https://www.youtube.com/embed/" ++ v.id.videoId ] []
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

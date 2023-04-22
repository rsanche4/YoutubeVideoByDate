//Import express and express router as shown in lecture code and worked in previous labs
//You can make your axios calls to the API directly in the routes
import axios from 'axios';
import moment from "moment";
import {Router} from 'express';
const router = Router();
const YOUR_API_KEY = process.env.KEY
let search_token_next = ''
let search_token_prev = ''
let search_ven_term = ''
let yearFrom = ''
let yearTo = ''
let search_term = ''
let current_items = {}

router.route('/').get(async (req, res) => {
  //code here for GET
  try {
    res.render('homepage', {
        title: 'Youtube Archive by Date'
    });
  } catch (e) {
    res.status(500).json({error: e});
  }

});

router.route('/nextSearchVenues').post(async (req, res) => {
  
  try {
    const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&pageToken=${search_token_next}&publishedBefore=${yearTo}-12-31T00%3A00%3A00Z&publishedAfter=${yearFrom}-01-01T00%3A00%3A00Z&q=${search_term}&maxResults=50&key=${YOUR_API_KEY}`)

    search_token_next = response.data.nextPageToken
    search_token_prev = response.data.prevPageToken
    
    res.render('venueSearchResults', {
      title: 'Video List',
      searchVenueTerm: search_ven_term,
      venues: response.data.items,
    })
  } catch (e) {
    
    res.status(404).render('venueNotFound', {
      title: 'Not Found',
      searchVenueTerm: search_ven_term
    })
  }
 
})

router.route('/prevSearchVenues').post(async (req, res) => {
  
  try {
    
    if (!search_token_prev) {
      res.render('venueSearchResults', {
        title: 'Video List',
        searchVenueTerm: search_ven_term,
        venues: current_items,
      })
      return
    }

    const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&pageToken=${search_token_prev}&publishedBefore=${yearTo}-12-31T00%3A00%3A00Z&publishedAfter=${yearFrom}-01-01T00%3A00%3A00Z&q=${search_term}&maxResults=50&key=${YOUR_API_KEY}`)

    search_token_next = response.data.nextPageToken
    search_token_prev = response.data.prevPageToken
    
    res.render('venueSearchResults', {
      title: 'Video List',
      searchVenueTerm: search_ven_term,
      venues: response.data.items,
    })
  } catch (e) {
    
    res.status(404).render('venueNotFound', {
      title: 'Not Found',
      searchVenueTerm: search_ven_term
    })
  }
 
})

router.route('/searchvenues').post(async (req, res) => {
  //code here for POST
  
  if (!req.body.searchVenueTerm) {
    res.status(400).render('error', {
      title: 'Error 400',
      error: 'Error 400: User did not input any text.',
    })
    return
  }
  if (req.body.searchVenueTerm.trim().length===0) {
    res.status(400).render('error', {
      title: 'Error 400',
      error: 'Error 400: User did not input any text.',
    })
    return
  }

  try {
     search_term = encodeURIComponent(req.body.searchVenueTerm.trim())
     yearFrom = req.body.yearFrom
     yearTo = req.body.yearTo

    const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&publishedBefore=${yearTo}-12-31T00%3A00%3A00Z&publishedAfter=${yearFrom}-01-01T00%3A00%3A00Z&q=${search_term}&maxResults=50&key=${YOUR_API_KEY}`)

    search_token_next = response.data.nextPageToken
    search_token_prev = response.data.prevPageToken
    search_ven_term = req.body.searchVenueTerm
    current_items = response.data.items

    res.render('venueSearchResults', {
      title: 'Video List',
      searchVenueTerm: req.body.searchVenueTerm,
      venues: response.data.items,
    })
  } catch (e) {
   
    res.status(404).render('venueNotFound', {
      title: 'Not Found',
      searchVenueTerm: req.body.searchVenueTerm
    })
  }
});

router.route('/venuedetails/:id').get(async (req, res) => {
  //code here for GET
  try {

  let response = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${req.params.id}&key=${YOUR_API_KEY}`)

  let stats = await axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${req.params.id}&key=${YOUR_API_KEY}`)
  
  res.render('venueByID', {
      title: 'Video',
      searchVenueTerm: req.body.searchVenueTerm,
      venues: response.data.items[0],
      date: moment(response.data.items[0].snippet.publishedAt).utc().format('MM/DD/YYYY'),
      desc: response.data.items[0].snippet.description.replace(/(?:\r\n|\r|\n)/g, '<br>'),
      likes: stats.data.items[0].statistics.likeCount.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      views: stats.data.items[0].statistics.viewCount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    })
  } catch (e) {
    res.status(404).render('venueNotFound', {
      title: 'Not Found',
    })
  }
});

export default router

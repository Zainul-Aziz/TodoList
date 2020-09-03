//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true});

mongoose.connect("mongodb://localhost:27017/todolistDB", {
useUnifiedTopology: true,
useNewUrlParser: true,
useFindAndModify:false
})
.then(() => console.log('DB Connected!'))
.catch(err => {
console.log(err);
});

const itemSchema = {
  name:String
};
const Item = mongoose.model("Item",itemSchema);
const item1 = new Item({
  name: "Welcome to TodoList"
});
const item2 = new Item({
  name: "Click + to add task"
});
const item3 = new Item({
  name: "Click - to delete task"
});

const defaultItems = [item1,item2,item3];
const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List",listSchema);
// Item.insertMany(defaultItems,function(err){
//   if(err)
//   {
//     console.log(err);
//   }
//   else
//   {
//     console.log("Successfully added");
//   }
// });


app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems,function(err){
      if(err)
      {
        console.log(err);
      }
      else
      {
        console.log("Successfully added");
      }
    });
    res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname = req.body.list;

  const item = new Item({
    name: itemName
  });
  if(listname === 'Today')
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name: listname}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listname);
    });
  }
  // item.save();
  // res.redirect("/");
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listname = req.body.listname;
  if(listname === "Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err){
    if(!err)
    {
      // console.log("Successfully deleted checked item");
      res.redirect("/");
    }
  });
  }
  else
  {
    List.findOneAndUpdate({name: listname},{$pull: {items: {_id:checkedItemId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/" + listname);
      }
    });
  }
  });

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  //console.log(customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err)
    {
      if(!foundList)
      {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else
      {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

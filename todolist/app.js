//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const app = express();
const _=require("lodash");
// mongoose.connect("mongodb://127.0.0.1/todolist",{useNewUrlParser:true})
// mongoose.connect("mongodb+srv://skandabhebbar:<6ZKaynOmIrEdVgUh>@tdl.hvrumah.mongodb.net/?retryWrites=true&w=majority");
mongoose.connect("mongodb+srv://skandabhebbar:6ZKaynOmIrEdVgUh@tdl.hvrumah.mongodb.net/?retryWrites=true&w=majority")
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema={
  name:String
};
const Item=mongoose.model("Items",itemSchema);
const item1=new Item({
  name:"welcome to todolist"
});
const item2=new Item({
  name:"hit + icon to create new item"
});
const item3=new Item({
  name:"<-- use the button to delete item"
});
const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemSchema]
}
const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  

 // Fetch items from the database
Item.find({})
.then(function (foundItems) {
  if (foundItems.length === 0) {
    // Insert default items when no items are found
    return Item.insertMany(defaultItems);
  } else {
    // Render the "list" view with the found items
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  }
})
.then(function (results) {
  if (results) {
    // If default items were inserted, log the success message
    console.log("Successfully saved default items");
  }
})
.catch(function (err) {
  console.log(err);
});
});
app.post("/", async function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName ==="Today") {
    item.save();
    res.redirect("/");
  } 
  else {
    try {
      const foundList = await List.findOne({ name: listName });
      if (foundList) {
        foundList.items.push(item);
        await foundList.save(); 
        res.redirect("/" + listName);
      } else {
        console.error("List not found.");
        res.redirect("/");
      }
    } catch (err) {
      console.error(err); 
      res.redirect("/");
    }
  }
});

app.post("/delete", async function (req, res) {
  const checkeItemId = req.body.checkbox;
  const listN = req.body.listname; // Use the correct variable name

  if (listN === "Today") {
    try {
      const removedItem = await Item.findByIdAndRemove(checkeItemId);
      if (removedItem) {
        console.log("Item removed");
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }

    res.redirect("/");
  } else {
    try {
      const foundlist = await List.findOne({ name: listN });
      if (foundlist) {
        foundlist.items.pull({ _id: checkeItemId }); // Remove the item from the array
        await foundlist.save();
        res.redirect("/" + listN);
      } else {
        console.error("List not found.");
        res.redirect("/");
      }
    } catch (err) {
      console.error("Error:", err);
      res.redirect("/");
    }
  }
});



app.get("/:customListname", function (req, res) {
  const customListname = _.capitalize(req.params.customListname);
  
  List.findOne({ name: customListname })
    .then((foundList) => {
      if (!foundList) {
        // Create a new list and redirect to it
        const list = new List({
          name: customListname,
          items: defaultItems
        });
        return list.save()
          .then(() => {
            res.redirect("/" + customListname);
          });
      } else {
        // Render the "list" view with the found items
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      res.redirect("/");
    });
});



// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

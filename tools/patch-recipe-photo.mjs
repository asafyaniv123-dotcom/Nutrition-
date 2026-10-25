/* A recipe's photo at the size it is shown (Asaf, 25 Oct: "the picture comes
 * out in low quality"). It was shrunk to 600x400 and kept inside the recipe
 * in localStorage - a third of the pixels a phone's full-width frame shows,
 * and as much as localStorage could afford. Now: up to 1600 on the long side
 * at JPEG 0.86, kept in the photo store (IndexedDB, the same one the coach's
 * and the evening's pictures use, and the backup already carries) with only
 * its key in the recipe. A recipe saved before keeps its picture as it was;
 * only a new picture can be sharper. */
import fs from 'fs';
const F = 'dev/index.html';
let s = fs.readFileSync(F, 'utf8');
const CR = s.includes('\r\n');
if (CR) s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('ANCHOR x' + n + ': ' + a.slice(0, 80)); process.exit(1); } s = s.replace(a, () => b); };
rep(`        (rec.photo?'<img class="rcp-th" src="'+rec.photo+'" alt="">':'<div class="rcp-ph">'+RCP_I.pot+'</div>')+`,
  `        (rec.photo?photoImg(rec.photo,'class="rcp-th" alt=""'):'<div class="rcp-ph">'+RCP_I.pot+'</div>')+`);
rep(`  h+='</div>';
  document.getElementById('content').innerHTML=h;
}

/* The servings field`, `  h+='</div>';
  document.getElementById('content').innerHTML=h;hydratePhotos(document.getElementById('content'));
}

/* The servings field`);
rep(`  if(rec.photo)h+='<img class="rcp-photo" src="'+rec.photo+'" alt="">';`, `  if(rec.photo)h+=photoImg(rec.photo,'class="rcp-photo" alt=""');`);
rep(`  if(rec.notes){
    h+='<div class="rcp-card"><div class="rcp-ch"><span class="rcp-ic amber">'+RCP_I.bulb+'</span>'+_t('הערות')+'</div>'+
       '<div class="rcp-note">'+esc(rec.notes)+'</div></div>';
  }
  h+='</div>';
  document.getElementById('content').innerHTML=h;`, `  if(rec.notes){
    h+='<div class="rcp-card"><div class="rcp-ch"><span class="rcp-ic amber">'+RCP_I.bulb+'</span>'+_t('הערות')+'</div>'+
       '<div class="rcp-note">'+esc(rec.notes)+'</div></div>';
  }
  h+='</div>';
  document.getElementById('content').innerHTML=h;hydratePhotos(document.getElementById('content'));`);
rep(`  if(rec.photo)h+='<img class="rcp-photo" src="'+rec.photo+'" id="rec-photo-prev" alt="">';`, `  if(rec.photo)h+=photoImg(rec.photo,'class="rcp-photo" id="rec-photo-prev" alt=""');`);
rep(`  document.getElementById('content').innerHTML=h;
  window._editRecipePhoto=rec.photo||'';`, `  document.getElementById('content').innerHTML=h;hydratePhotos(document.getElementById('content'));
  window._editRecipePhoto=rec.photo||'';`);
rep(`      var maxW=600,maxH=400;
      var scale=Math.min(maxW/img.width,maxH/img.height,1);`, `      /* the size it is shown at: a full-width frame on a phone is ~1200 device pixels */
      var scale=Math.min(1600/Math.max(img.width,img.height),1);`);
rep(`      _editRecipePhoto=canvas.toDataURL('image/jpeg',0.8);`, `      _editRecipePhoto=canvas.toDataURL('image/jpeg',0.86);`);
rep(`  var recipes=loadRecipes();
  var rec={
    name:(name.value.trim()),`, `  var recipes=loadRecipes(),was=_recipeIdx>=0&&recipes[_recipeIdx]?recipes[_recipeIdx].photo||'':'';
  /* a new picture goes to the photo store and the recipe keeps its key */
  if(_editRecipePhoto&&!isPhotoKey(_editRecipePhoto)&&_editRecipePhoto!==was){
    var pic=_editRecipePhoto;
    photoPut(pic).then(function(k){_editRecipePhoto=k||pic;if(k&&isPhotoKey(was))photoDel(was);saveRecipe();});
    return;
  }
  var rec={
    name:(name.value.trim()),`);
rep(`function deleteRecipe(){
  var recipes=loadRecipes();recipes.splice(_recipeIdx,1);saveRecipes(recipes);`, `function deleteRecipe(){
  var recipes=loadRecipes();if(recipes[_recipeIdx])photoDel(recipes[_recipeIdx].photo);recipes.splice(_recipeIdx,1);saveRecipes(recipes);`);
if (CR) s = s.replace(/\n/g, '\r\n');
fs.writeFileSync(F, s);
console.log('ok');

using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Main : MonoBehaviour
{

    public Canvas GUI;
    public Button enterButton;

    void Start()
    {
        enterButton.onClick.AddListener(() =>
        {
            GUI.GetComponent<CanvasGroup>().alpha = 0;
            //GameObject.Find("Button").GetComponent<Image>().CrossFadeAlpha(0.1f, 2.0f, false);
        });
    }

    void Update()
    {
    }
}
